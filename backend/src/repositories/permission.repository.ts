
import prisma from '../lib/prisma';
import { Permission, RolePermission } from '@prisma/client';

export class PermissionRepository {
  async getAllPermissions(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPermissionById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id }
    });
  }

  async getPermissionByCode(permissionCode: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { permissionCode }
    });
  }

  async createPermission(data: {
    permissionCode: string;
    permissionName: string;
    description?: string;
  }): Promise<Permission> {
    return prisma.permission.create({
      data
    });
  }

  async updatePermission(
    id: number,
    data: { permissionName?: string; description?: string }
  ): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data
    });
  }

  async deletePermission(id: number): Promise<Permission> {
    return prisma.permission.delete({
      where: { id }
    });
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    // Check if assignment already exists
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId }
    });

    if (existing) {
      return existing;
    }

    return prisma.rolePermission.create({
      data: { roleId, permissionId }
    });
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<RolePermission | null> {
    const assignment = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId }
    });

    if (!assignment) {
      return null;
    }

    return prisma.rolePermission.delete({
      where: { id: assignment.id }
    });
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });

    return rolePermissions.map(rp => rp.permission);
  }
}
