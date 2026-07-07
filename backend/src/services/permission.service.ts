
import { PermissionRepository } from '../repositories/permission.repository';
import {
  CreatePermissionDTO,
  UpdatePermissionDTO,
  AssignPermissionDTO,
  RemovePermissionDTO
} from '../dtos/permission.dto';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { Permission, RolePermission } from '@prisma/client';

const defaultPermissions = [
  'VIEW_PRODUCTS', 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
  'VIEW_USERS', 'MANAGE_PAYMENTS', 'MANAGE_ROLES'
];

export class PermissionService {
  private permissionRepository: PermissionRepository;

  constructor() {
    this.permissionRepository = new PermissionRepository();
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.getAllPermissions();
  }

  async getPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.getPermissionById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }
    return permission;
  }

  async createPermission(data: CreatePermissionDTO): Promise<Permission> {
    // Validate input
    if (!data.permissionCode || data.permissionCode.trim() === '') {
      throw new BadRequestError('Permission code is required');
    }
    if (!data.permissionName || data.permissionName.trim() === '') {
      throw new BadRequestError('Permission name is required');
    }

    // Check if permission already exists
    const existingPermission = await this.permissionRepository.getPermissionByCode(data.permissionCode);
    if (existingPermission) {
      throw new ConflictError('Permission with this code already exists');
    }

    return this.permissionRepository.createPermission(data);
  }

  async updatePermission(id: number, data: UpdatePermissionDTO): Promise<Permission> {
    // Check if permission exists
    const permission = await this.permissionRepository.getPermissionById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    return this.permissionRepository.updatePermission(id, data);
  }

  async deletePermission(id: number): Promise<void> {
    // Check if permission exists
    const permission = await this.permissionRepository.getPermissionById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // Prevent deleting default permissions
    if (defaultPermissions.includes(permission.permissionCode)) {
      throw new BadRequestError('Cannot delete default system permissions');
    }

    await this.permissionRepository.deletePermission(id);
  }

  async assignPermissionToRole(data: AssignPermissionDTO): Promise<RolePermission> {
    return this.permissionRepository.assignPermissionToRole(data.roleId, data.permissionId);
  }

  async removePermissionFromRole(data: RemovePermissionDTO): Promise<RolePermission | null> {
    return this.permissionRepository.removePermissionFromRole(data.roleId, data.permissionId);
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return this.permissionRepository.getRolePermissions(roleId);
  }
}
