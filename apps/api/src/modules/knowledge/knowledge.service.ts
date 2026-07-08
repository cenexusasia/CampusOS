import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface SearchResult {
  id: string;
  content: string;
  chunkIndex: number;
  metadata: any;
  similarity?: number;
  document: {
    id: string;
    name: string;
    mimeType: string;
    status: string;
  };
  createdAt: Date;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly embeddingEndpoint = 'https://api.deepseek.com/v1/embeddings';

  constructor(private readonly prisma: PrismaService) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const response = await fetch(this.embeddingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-embedding',
        input: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `DeepSeek embeddings API error (${response.status}): ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
    };

    if (!data.data?.[0]?.embedding) {
      throw new Error('Unexpected DeepSeek embeddings response format');
    }

    return data.data[0].embedding;
  }

  async ensureVectorColumn(): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1536)`,
    );
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`,
    );
    this.logger.log('Ensured vector column and index exist on document_chunks');
  }

  async upload(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'No file provided',
      });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'knowledge', tenantId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const extension = path.extname(file.originalname) || '';
    const storageName = `${uuidv4()}${extension}`;
    const filePath = path.join(uploadDir, storageName);
    fs.writeFileSync(filePath, file.buffer);

    const relativePath = path.join('uploads', 'knowledge', tenantId, storageName);

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filePath: relativePath,
        status: 'PROCESSING',
        metadata: {
          uploadedBy: userId,
          originalName: file.originalname,
        },
      },
    });

    this.logger.log(`Document uploaded: ${document.id} (${file.originalname})`);

    // Extract text and create chunks
    try {
      const text = await this.extractText(file.buffer, file.mimetype);
      const chunks = this.chunkText(text, 1000);

      if (chunks.length > 0) {
        // Ensure vector column exists before storing embeddings
        try {
          await this.ensureVectorColumn();
        } catch (err: any) {
          this.logger.warn(
            `Could not ensure vector column (non-fatal): ${err.message}`,
          );
        }

        // Create chunks first, then update embeddings
        const createdChunks = await this.prisma.$transaction(
          chunks.map((content, index) =>
            this.prisma.documentChunk.create({
              data: {
                documentId: document.id,
                content,
                chunkIndex: index,
                metadata: {},
              },
            }),
          ),
        );
        this.logger.log(
          `Created ${createdChunks.length} chunks for document ${document.id}`,
        );

        // Generate embeddings for each chunk (best-effort, non-blocking)
        this.generateChunkEmbeddings(createdChunks, document.id);
      }

      await this.prisma.document.update({
        where: { id: document.id },
        data: { status: 'READY' },
      });
    } catch (error: any) {
      this.logger.error(
        `Text extraction failed for document ${document.id}: ${error.message}`,
      );
      await this.prisma.document.update({
        where: { id: document.id },
        data: { status: 'FAILED' },
      });
    }

    return this.prisma.document.findUnique({
      where: { id: document.id },
      include: { _count: { select: { chunks: true } } },
    });
  }

  /**
   * Background: generate embeddings for all chunks of a document.
   * Runs asynchronously — failures are logged but don't block the upload response.
   */
  private async generateChunkEmbeddings(
    chunks: Array<{ id: string; content: string }>,
    documentId: string,
  ): Promise<void> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'DEEPSEEK_API_KEY not set — skipping embedding generation',
      );
      return;
    }

    for (const chunk of chunks) {
      try {
        const embedding = await this.generateEmbedding(chunk.content);
        const vectorStr = `[${embedding.join(',')}]`;
        await this.prisma.$executeRawUnsafe(
          `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
          vectorStr,
          chunk.id,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to generate embedding for chunk ${chunk.id} of document ${documentId}: ${err.message}`,
        );
      }
    }

    this.logger.log(
      `Finished embedding generation for document ${documentId} (${chunks.length} chunks)`,
    );
  }

  async search(
    tenantId: string,
    query: string,
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Search query is required',
      });
    }

    // Try semantic search first
    try {
      const results = await this.semanticSearch(tenantId, query);
      if (results.length > 0) {
        return results;
      }
    } catch (err: any) {
      this.logger.warn(
        `Semantic search failed, falling back to keyword search: ${err.message}`,
      );
    }

    // Fallback to keyword search
    return this.keywordSearch(tenantId, query);
  }

  /**
   * Cosine similarity search using pgvector.
   */
  private async semanticSearch(
    tenantId: string,
    query: string,
  ): Promise<SearchResult[]> {
    const embedding = await this.generateEmbedding(query);
    const vectorStr = `[${embedding.join(',')}]`;

    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        content: string;
        chunk_index: number;
        metadata: any;
        document_id: string;
        document_name: string;
        mime_type: string;
        status: string;
        created_at: Date;
        similarity: number;
      }>
    >(
      `SELECT
        dc.id,
        dc.content,
        dc.chunk_index,
        dc.metadata,
        dc.document_id,
        d.name AS document_name,
        d.mime_type,
        d.status,
        dc.created_at,
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE d.tenant_id = $2
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> $1::vector
      LIMIT 10`,
      vectorStr,
      tenantId,
    );

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      chunkIndex: row.chunk_index,
      metadata: row.metadata,
      similarity: row.similarity,
      document: {
        id: row.document_id,
        name: row.document_name,
        mimeType: row.mime_type,
        status: row.status,
      },
      createdAt: row.created_at,
    }));
  }

  /**
   * Keyword (LIKE/contains) search as fallback.
   */
  private async keywordSearch(
    tenantId: string,
    query: string,
  ): Promise<SearchResult[]> {
    const chunks = await this.prisma.documentChunk.findMany({
      where: {
        document: { tenantId },
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            status: true,
          },
        },
      },
      orderBy: { chunkIndex: 'asc' },
      take: 50,
    });

    return chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      metadata: chunk.metadata,
      document: chunk.document,
      createdAt: chunk.createdAt,
    }));
  }

  async findAll(tenantId: string): Promise<any[]> {
    return this.prisma.document.findMany({
      where: { tenantId },
      include: {
        _count: { select: { chunks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(tenantId: string, documentId: string): Promise<{ id: string }> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Document not found',
      });
    }

    const fullPath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    this.logger.log(`Document deleted: ${documentId}`);
    return { id: documentId };
  }

  private async extractText(
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    switch (mimeType) {
      case 'application/pdf': {
        const parser = new PDFParse(buffer);
        const result = await parser.getText();
        return result.text;
      }
      case 'text/plain':
      case 'text/markdown':
        return buffer.toString('utf-8');
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      default:
        this.logger.warn(`Unsupported mime type: ${mimeType}, falling back to raw text`);
        return buffer.toString('utf-8');
    }
  }

  private chunkText(text: string, maxChunkSize: number): string[] {
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const paragraphs = normalized.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // If a single paragraph exceeds maxChunkSize, split by sentences
      if (trimmedParagraph.length > maxChunkSize) {
        // Flush current chunk first
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // Split paragraph into sentences and chunk those
        const sentences = trimmedParagraph.match(/[^.!?\n]+[.!?]*\s*/g) || [
          trimmedParagraph,
        ];
        let sentenceChunk = '';

        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length > maxChunkSize) {
            if (sentenceChunk) {
              chunks.push(sentenceChunk.trim());
              sentenceChunk = sentence;
            } else {
              // Sentence itself exceeds maxChunkSize, hard-split
              chunks.push(sentence.trim());
              sentenceChunk = '';
            }
          } else {
            sentenceChunk += sentence;
          }
        }
        if (sentenceChunk) {
          chunks.push(sentenceChunk.trim());
        }
        continue;
      }

      // Try to add paragraph to current chunk
      const separator = currentChunk ? '\n\n' : '';
      const candidate = currentChunk + separator + trimmedParagraph;

      if (candidate.length <= maxChunkSize) {
        currentChunk = candidate;
      } else {
        // Flush and start new chunk with overlap
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          // Carry last 50 chars as overlap
          const overlap =
            currentChunk.length > 50
              ? currentChunk.slice(-50)
              : currentChunk;
          currentChunk = overlap + '\n\n' + trimmedParagraph;
        } else {
          currentChunk = trimmedParagraph;
        }
      }
    }

    // Flush remaining
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
