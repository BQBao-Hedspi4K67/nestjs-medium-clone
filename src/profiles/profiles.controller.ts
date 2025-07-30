import { Controller, Delete, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileResponse } from './interfaces/profile.interface';
import { GetUser } from '../articles/common/decorators/get-user.decorator';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface JwtPayload {
  sub: number;
  email: string;
}

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(OptionalJwtGuard)
  async getProfile(
    @Param('username') username: string,
    @Request() req: any,
  ): Promise<ProfileResponse> {
    return this.profilesService.getProfile(username, req.user?.sub);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('username') username: string,
    @GetUser() user: JwtPayload,
  ): Promise<ProfileResponse> {
    return this.profilesService.followUser(username, user.sub);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @GetUser() user: JwtPayload,
  ): Promise<ProfileResponse> {
    return this.profilesService.unfollowUser(username, user.sub);
  }

  @Get('debug/follows/:userId')
  async getFollows(@Param('userId') userId: string) {
    return this.profilesService.getDebugFollows(parseInt(userId));
  }
}
