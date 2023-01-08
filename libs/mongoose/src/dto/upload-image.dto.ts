import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userID!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filename!: string;
}
