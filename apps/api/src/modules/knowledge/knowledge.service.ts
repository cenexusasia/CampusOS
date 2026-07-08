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
    return document;
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
}
