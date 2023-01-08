import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { ApiService } from '../api.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateImageDto } from '@app/mongoose/dto/upload-image.dto';
import { UseGuards } from '@nestjs/common';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly apiService: ApiService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns a user object',
  })
  @HttpCode(200)
  @Get(':_id')
  async getUser(@Param('_id') id: string) {
    const resp = await this.apiService.getUser(id);
    return resp;
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns a user object with email',
  })
  @HttpCode(200)
  @Get('email/:email')
  async getUserByMail(@Param('email') id: string) {
    const resp = await this.apiService.getUserByMail(id);
    return resp;
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Upload images to s3',
  })
  @HttpCode(200)
  @Post('upload')
  async upload(@Body() body: CreateImageDto) {
    const buffer = await this.apiService.fetchBuffer(body.url);
    if (!buffer) return { message: 'Invalid URL' };
    const resp = this.apiService.upload(buffer, body.userID, body.filename);
    return resp;
  }
}
