import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileResponse } from './interfaces/profile.interface';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, currentUserId?: number): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    // Check if current user is following this user using raw query
    let following = false;
    if (currentUserId) {
      const followCheck = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "Follow" 
        WHERE "followerId" = ${currentUserId} AND "followingId" = ${user.id}
      `;
      
      const count = Number((followCheck as any)[0].count);
      following = count > 0;
    }

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following,
      },
    };
  }

  async followUser(username: string, currentUserId: number): Promise<ProfileResponse> {
    const userToFollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      throw new NotFoundException('Profile not found');
    }

    if (userToFollow.id === currentUserId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Follow" 
      WHERE "followerId" = ${currentUserId} AND "followingId" = ${userToFollow.id}
    `;

    const existingCount = Number((existingFollow as any)[0].count);

    if (existingCount === 0) {
      await this.prisma.$executeRaw`
        INSERT INTO "Follow" ("followerId", "followingId", "createdAt")
        VALUES (${currentUserId}, ${userToFollow.id}, NOW())
      `;
    }

    return this.getProfile(username, currentUserId);
  }

  async unfollowUser(username: string, currentUserId: number): Promise<ProfileResponse> {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.$executeRaw`
      DELETE FROM "Follow" 
      WHERE "followerId" = ${currentUserId} AND "followingId" = ${userToUnfollow.id}
    `;

    return this.getProfile(username, currentUserId);
  }

  async getDebugFollows(userId: number) {
    const follows = await this.prisma.$queryRaw`
      SELECT f.*, 
             u1.username as follower_username,
             u2.username as following_username
      FROM "Follow" f
      JOIN "User" u1 ON f."followerId" = u1.id
      JOIN "User" u2 ON f."followingId" = u2.id
      WHERE f."followerId" = ${userId} OR f."followingId" = ${userId}
    `;
    
    return {
      userId,
      followRelationships: follows
    };
  }
}
