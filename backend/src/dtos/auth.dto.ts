export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LogoutDTO {
  refreshToken: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
