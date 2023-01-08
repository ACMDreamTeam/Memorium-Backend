import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@app/mongoose';
import { S3 } from 'aws-sdk';
import { request } from 'undici';

const bucket = 'acmmjcet-memorium';

@Injectable()
export class ApiService {
  private s3: S3 = new S3({});
  constructor(
    private userModule: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.config.get('accessKey'),
      secretAccessKey: this.config.get('secretKey'),
      region: this.config.get('region'),
    });
  }

  async isAuthenticated(token: string | undefined) {
    if (!token) return false;
    try {
      const { uid } = this.jwtService.verify(token.replace(/^Bearer\s+/, ''), {
        secret: this.config.get('JWT_SECRET'),
      });
      const exists = await this.userModule.userExists(uid);
      return !!(uid && exists);
    } catch (e) {
      return false;
    }
  }

  async getUser(id: string) {
    const resp = await this.userModule.findOneByUid(id);
    delete resp?.password;
    return resp;
  }

  async getUserByMail(mail: string) {
    const resp = await this.userModule.findOneByEmail(mail);
    delete resp?.password;
    return resp;
  }

  softDelete(id: string) {
    return this.userModule.softDeleteUser(id);
  }

  async updateUser(id: string, data: any) {
    const a = await this.userModule.updateOneByUid(id, data);
    if (!a) return { message: 'User not found' };
    return a;
  }

  upload(buffer: Buffer, userID: string, filename: string) {
    const params = {
      Bucket: bucket,
      Key: `${userID}/${filename}`,
      Body: buffer,
    };
    return this.s3.upload(params).promise();
  }

  async fetchBuffer(input: string) {
    if (Buffer.isBuffer(input)) return input;
    if (input.startsWith('http')) {
      const res = await request(input);
      const arrBuffer = await res.body.arrayBuffer();
      return Buffer.from(arrBuffer);
    }
    return null;
  }
}
