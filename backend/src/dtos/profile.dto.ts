export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

export interface UpdateAvatarDto {
  avatar: string;
}
