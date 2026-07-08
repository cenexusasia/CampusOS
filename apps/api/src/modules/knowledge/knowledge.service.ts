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

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private readonly prisma: PrismaService) {}

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
        await this.prisma.documentChunk.createMany({
          data: chunks.map((content, index) => ({
            documentId: document.id,
            content,
            chunkIndex: index,
            metadata: {},
          })),
        });
        this.logger.log(
          `Created ${chunks.length} chunks for document ${document.id}`,
        );
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

  async search(tenantId: string, query: string): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Search query is required',
      });
    }

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
