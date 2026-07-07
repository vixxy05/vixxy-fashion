
import prisma from '../lib/prisma';
import { Role, UserRole, Permission } from '@prisma/client';

export class RoleRepository {
  async getAllRoles(): Promise<Role[]> {
    return prisma.role.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRoleById(id: number): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id }
    });
  }

  async getRoleByName(roleName: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { roleName }
    });
  }

  async createRole(data: {
    roleName: string;
    description?: string;
  }): Promise<Role> {
    return prisma.role.create({
      data
    });
  }

  async updateRole(
    id: number,
    data: { roleName?: string; description?: string }
  ): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data
    });
  }

  async deleteRole(id: number): Promise<Role> {
    return prisma.role.delete({
      where: { id }
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<UserRole> {
    // Check if assignment already exists
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId }
    });

    if (existing) {
      return existing;
    }

    return prisma.userRole.create({
      data: { userId, roleId }
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<UserRole | null> {
    const assignment = await prisma.userRole.findFirst({
      where: { userId, roleId }
    });

    if (!assignment) {
      return null;
    }

    return prisma.userRole.delete({
      where: { id: assignment.id }
    });
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });

    return userRoles.map(ur => ur.role);
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const permissions = new Map<number, Permission>();

    userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        if (!permissions.has(rp.permission.id)) {
          permissions.set(rp.permission.id, rp.permission);
        }
      });
    });

    return Array.from(permissions.values());
  }
}
