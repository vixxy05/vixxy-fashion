
export interface CreateRoleDTO {
  roleName: string;
  description?: string;
}

export interface UpdateRoleDTO {
  roleName?: string;
  description?: string;
}

export interface AssignRoleDTO {
  userId: number;
  roleId: number;
}

export interface RemoveRoleDTO {
  userId: number;
  roleId: number;
}
