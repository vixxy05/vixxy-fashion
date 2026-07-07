
import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { successResponse } from '../utils/response';

const roleService = new RoleService();

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.getAllRoles();
    return successResponse(res, roles, 'Roles fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const role = await roleService.getRoleById(id);
    return successResponse(res, role, 'Role fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await roleService.createRole(req.body);
    return successResponse(res, role, 'Role created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const role = await roleService.updateRole(id, req.body);
    return successResponse(res, role, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await roleService.deleteRole(id);
    return successResponse(res, null, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignment = await roleService.assignRoleToUser(req.body);
    return successResponse(res, assignment, 'Role assigned to user successfully');
  } catch (error) {
    next(error);
  }
};

export const removeRoleFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignment = await roleService.removeRoleFromUser(req.body);
    return successResponse(res, assignment, 'Role removed from user successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
    const roles = await roleService.getUserRoles(userId);
    return successResponse(res, roles, 'User roles fetched successfully');
  } catch (error) {
    next(error);
  }
};
