
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDTO, UpdateRoleDTO, AssignRoleDTO, RemoveRoleDTO } from '../dtos/role.dto';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { Role, UserRole } from '@prisma/client';

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.getAllRoles();
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.getRoleById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return role;
  }

  async createRole(data: CreateRoleDTO): Promise<Role> {
    // Validate input
    if (!data.roleName || data.roleName.trim() === '') {
      throw new BadRequestError('Role name is required');
    }

    // Check if role already exists
    const existingRole = await this.roleRepository.getRoleByName(data.roleName);
    if (existingRole) {
      throw new ConflictError('Role with this name already exists');
    }

    return this.roleRepository.createRole(data);
  }

  async updateRole(id: number, data: UpdateRoleDTO): Promise<Role> {
    // Check if role exists
    const role = await this.roleRepository.getRoleById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // If updating roleName, check if new name is already taken
    if (data.roleName && data.roleName !== role.roleName) {
      const existingRole = await this.roleRepository.getRoleByName(data.roleName);
      if (existingRole) {
        throw new ConflictError('Role with this name already exists');
      }
    }

    return this.roleRepository.updateRole(id, data);
  }

  async deleteRole(id: number): Promise<void> {
    // Check if role exists
    const role = await this.roleRepository.getRoleById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Prevent deleting default roles
    const defaultRoles = ['CUSTOMER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];
    if (defaultRoles.includes(role.roleName)) {
      throw new BadRequestError('Cannot delete default system roles');
    }

    await this.roleRepository.deleteRole(id);
  }

  async assignRoleToUser(data: AssignRoleDTO): Promise<UserRole> {
    return this.roleRepository.assignRoleToUser(data.userId, data.roleId);
  }

  async removeRoleFromUser(data: RemoveRoleDTO): Promise<UserRole | null> {
    return this.roleRepository.removeRoleFromUser(data.userId, data.roleId);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    return this.roleRepository.getUserRoles(userId);
  }
}
