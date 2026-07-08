import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock fs and path
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('node:path', () => ({
  extname: vi.fn(() => '.pdf'),
  join: vi.fn((...args: string[]) => args.join('/')),
  default: { extname: vi.fn(() => '.pdf'), join: vi.fn((...args: string[]) => args.join('/')) },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid'),
}));

// Mock pdf-parse — must export a class/constructor (source uses `new PDFParse(buffer)`)
vi.mock('pdf-parse', () => ({
  PDFParse: class MockPDFParse {
    getText = vi.fn().mockResolvedValue({ text: 'Extracted PDF content' });
  },
}));

// Mock mammoth
vi.mock('mammoth', () => ({
  extractRawText: vi.fn().mockResolvedValue({ value: 'Extracted DOCX content' }),
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const mockDocument = {
  id: 'doc-1',
  tenantId: 'tenant-1',
  name: 'test-doc.pdf',
  description: null,
  filePath: 'uploads/knowledge/tenant-1/mocked-uuid.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  status: 'READY',
  metadata: { uploadedBy: 'user-1', originalName: 'test-doc.pdf' },
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  _count: { chunks: 2 },
  chunks: [],
};

const mockChunk = {
  id: 'chunk-1',
  documentId: 'doc-1',
  content: 'Extracted PDF content',
  chunkIndex: 0,
  metadata: {},
  createdAt: new Date('2025-01-01T00:00:00Z'),
  document: { id: 'doc-1', name: 'test-doc.pdf', mimeType: 'application/pdf', status: 'READY' },
};

const mockSearchResult = {
  id: 'chunk-1',
  content: 'Extracted PDF content',
  chunkIndex: 0,
  metadata: {},
  similarity: 0.95,
  document: { id: 'doc-1', name: 'test-doc.pdf', mimeType: 'application/pdf', status: 'READY' },
  createdAt: new Date('2025-01-01T00:00:00Z'),
};

const mockPrisma = {
  document: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  documentChunk: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $queryRawUnsafe: vi.fn(),
};

// Mock the global fetch
const mockFetchResponse = {
  ok: true,
  json: vi.fn().mockResolvedValue({
    data: [{ embedding: Array(1536).fill(0.1) }],
  }),
  text: vi.fn(),
};
const originalFetch = globalThis.fetch;

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // -----------------------------------------------------------------------
  // upload
  // -----------------------------------------------------------------------
  describe('upload', () => {
    const mockFile: Express.Multer.File = {
      originalname: 'test-doc.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('fake pdf content'),
      fieldname: 'file',
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should upload a file and create document record', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      prisma.document.create.mockResolvedValue(mockDocument);
      prisma.$transaction.mockResolvedValue([mockChunk]);
      prisma.document.update.mockResolvedValue(mockDocument);
      prisma.document.findUnique.mockResolvedValue(mockDocument);

      const result = await service.upload('tenant-1', 'user-1', mockFile);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          name: 'test-doc.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          filePath: expect.stringContaining('uploads/knowledge/tenant-1/mocked-uuid.pdf'),
          status: 'PROCESSING',
          metadata: { uploadedBy: 'user-1', originalName: 'test-doc.pdf' },
        },
      });
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: { status: 'READY' },
      });
      expect(prisma.document.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        include: { _count: { select: { chunks: true } } },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        service.upload('tenant-1', 'user-1', null as any),
      ).rejects.toThrow(
        new BadRequestException({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No file provided',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // findAll
  // -----------------------------------------------------------------------
  describe('findAll', () => {
    it('should return documents for a tenant', async () => {
      prisma.document.findMany.mockResolvedValue([mockDocument]);

      const result = await service.findAll('tenant-1');

      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { _count: { select: { chunks: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockDocument]);
    });

    it('should return empty array when no documents exist', async () => {
      prisma.document.findMany.mockResolvedValue([]);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // search
  // -----------------------------------------------------------------------
  describe('search', () => {
    it('should throw BadRequestException for empty query', async () => {
      await expect(service.search('tenant-1', '')).rejects.toThrow(
        new BadRequestException({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Search query is required',
        }),
      );

      await expect(service.search('tenant-1', '   ')).rejects.toThrow(
        new BadRequestException({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Search query is required',
        }),
      );
    });

    it('should perform semantic search and return results', async () => {
      process.env.DEEPSEEK_API_KEY = 'test-key';
      // Mock the raw query result
      prisma.$queryRawUnsafe.mockResolvedValue([
        {
          id: 'chunk-1',
          content: 'Extracted PDF content',
          chunk_index: 0,
          metadata: {},
          document_id: 'doc-1',
          document_name: 'test-doc.pdf',
          mime_type: 'application/pdf',
          status: 'READY',
          created_at: new Date('2025-01-01T00:00:00Z'),
          similarity: 0.95,
        },
      ]);

      const result = await service.search('tenant-1', 'AI concepts');

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]?.content).toBe('Extracted PDF content');
      expect(result[0]?.similarity).toBe(0.95);
    });

    it('should fall back to keyword search when semantic search fails', async () => {
      // Make embedding fetch fail
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('API error'));

      prisma.documentChunk.findMany.mockResolvedValue([mockChunk]);

      const result = await service.search('tenant-1', 'AI concepts');

      expect(prisma.documentChunk.findMany).toHaveBeenCalledWith({
        where: {
          document: { tenantId: 'tenant-1' },
          content: { contains: 'AI concepts', mode: 'insensitive' },
        },
        include: {
          document: {
            select: { id: true, name: true, mimeType: true, status: true },
          },
        },
        orderBy: { chunkIndex: 'asc' },
        take: 50,
      });
      expect(result).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------------------
  // delete
  // -----------------------------------------------------------------------
  describe('delete', () => {
    it('should delete a document and its file', async () => {
      prisma.document.findFirst.mockResolvedValue(mockDocument);
      vi.mocked(fs.existsSync).mockReturnValue(true);
      prisma.document.delete.mockResolvedValue(mockDocument);

      const result = await service.delete('tenant-1', 'doc-1');

      expect(prisma.document.findFirst).toHaveBeenCalledWith({
        where: { id: 'doc-1', tenantId: 'tenant-1' },
      });
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(prisma.document.delete).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
      expect(result).toEqual({ id: 'doc-1' });
    });

    it('should throw NotFoundException for wrong tenant ID', async () => {
      prisma.document.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('wrong-tenant', 'doc-1'),
      ).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        }),
      );

      expect(prisma.document.delete).not.toHaveBeenCalled();
    });

    it('should still delete the record even if file does not exist', async () => {
      prisma.document.findFirst.mockResolvedValue(mockDocument);
      vi.mocked(fs.existsSync).mockReturnValue(false);
      prisma.document.delete.mockResolvedValue(mockDocument);

      const result = await service.delete('tenant-1', 'doc-1');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(prisma.document.delete).toHaveBeenCalled();
      expect(result).toEqual({ id: 'doc-1' });
    });
  });
});
