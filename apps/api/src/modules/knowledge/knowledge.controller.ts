import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Knowledge')
@Controller('knowledge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a document to the knowledge base' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
      },
    },
  })
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.knowledgeService.upload(
      req.user.tenantId,
      req.user.sub,
      file,
    );
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Keyword search across document chunks' })
  async search(
    @Request() req: any,
    @Body('query') query: string,
  ) {
    return this.knowledgeService.search(req.user.tenantId, query);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all documents in the knowledge base' })
  async getDocuments(@Request() req: any) {
    return this.knowledgeService.findAll(req.user.tenantId);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a document by ID' })
  async deleteDocument(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.knowledgeService.delete(req.user.tenantId, id);
  }
}
