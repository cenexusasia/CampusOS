import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EVENTS } from '../../events/events.module';

export class RegisterWebhookDto {
  @ApiProperty({
    description: 'Event type to subscribe to',
    enum: Object.values(EVENTS),
  })
  @IsString()
  @IsIn(Object.values(EVENTS))
  event!: string;

  @ApiProperty({ description: 'Destination webhook URL' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;

  @ApiPropertyOptional({
    description: 'Optional HMAC secret for payload signing',
  })
  @IsOptional()
  @IsString()
  secret?: string;
}
