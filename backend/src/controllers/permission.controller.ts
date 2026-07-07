
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';
import { successResponse } from '../utils/response';

const permissionService = new PermissionService();

export const getAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    return successResponse(res, permissions, 'Permissions fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getPermissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const permission = await permissionService.getPermissionById(id);
    return successResponse(res, permission, 'Permission fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    return successResponse(res, permission, 'Permission created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const permission = await permissionService.updatePermission(id, req.body);
    return successResponse(res, permission, 'Permission updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await permissionService.deletePermission(id);
    return successResponse(res, null, 'Permission deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignPermissionToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignment = await permissionService.assignPermissionToRole(req.body);
    return successResponse(res, assignment, 'Permission assigned to role successfully');
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignment = await permissionService.removePermissionFromRole(req.body);
    return successResponse(res, assignment, 'Permission removed from role successfully');
  } catch (error) {
    next(error);
  }
};

export const getRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleId = Number(Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId);
    const permissions = await permissionService.getRolePermissions(roleId);
    return successResponse(res, permissions, 'Role permissions fetched successfully');
  } catch (error) {
    next(error);
  }
};
