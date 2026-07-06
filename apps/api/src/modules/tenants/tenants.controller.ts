import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '@api/modules/auth/guards/jwt-auth.guard';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new tenant' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all tenants' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  findAll(@Query() query: { page?: number; perPage?: number }) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update tenant' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete tenant (soft delete)' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Invite a user to tenant' })
  inviteUser(@Param('id') id: string, @Body() dto: InviteUserDto) {
    return this.tenantsService.inviteUser(id, dto);
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Accept a tenant invitation' })
  acceptInvitation(@Body('token') token: string, @Request() req: any) {
    return this.tenantsService.acceptInvitation(token, req.user.sub);
  }

  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Suspend a tenant' })
  suspendTenant(@Param('id') id: string) {
    return this.tenantsService.suspendTenant(id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Activate a tenant' })
  activateTenant(@Param('id') id: string) {
    return this.tenantsService.activateTenant(id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List tenant members' })
  getMembers(
    @Param('id') id: string,
    @Query() query: { page?: number; perPage?: number },
  ) {
    return this.tenantsService.getMembers(id, query);
  }

  @Put(':id/members/:membershipId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update member role' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
    @Body('role') role: string,
  ) {
    return this.tenantsService.updateMemberRole(id, membershipId, role);
  }

  @Delete(':id/members/:membershipId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove member from tenant' })
  removeMember(
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.tenantsService.removeMember(id, membershipId);
  }
}
