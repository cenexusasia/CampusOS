import { PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
export declare class ZodValidationPipe implements PipeTransform {
    private readonly schema;
    private readonly logger;
    constructor(schema: ZodSchema);
    transform(value: unknown): unknown;
}
