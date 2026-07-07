import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/password.dto';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegisterDTO(data: Partial<RegisterDTO>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate email
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }

  // Validate password
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  // Validate fullName
  if (!data.fullName) {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  } else if (data.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
  }

  // Optional: Validate phone if provided
  if (data.phone) {
    if (!/^[0-9]{10,15}$/.test(data.phone)) {
      errors.push({ field: 'phone', message: 'Phone number is invalid (must be 10-15 digits)' });
    }
  }

  return errors;
}

export function validateLoginDTO(data: Partial<LoginDTO>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

export function validateForgotPasswordDto(data: Partial<ForgotPasswordDto>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
  }
  return errors;
}

export function validateResetPasswordDto(data: Partial<ResetPasswordDto>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.token) {
    errors.push({ field: 'token', message: 'Token is required' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  return errors;
}
