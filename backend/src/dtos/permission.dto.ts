
export interface CreatePermissionDTO {
  permissionCode: string;
  permissionName: string;
  description?: string;
}

export interface UpdatePermissionDTO {
  permissionName?: string;
  description?: string;
}

export interface AssignPermissionDTO {
  roleId: number;
  permissionId: number;
}

export interface RemovePermissionDTO {
  roleId: number;
  permissionId: number;
}
