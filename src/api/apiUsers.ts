// src/api/apiUsers.ts
import api from './axios';

export interface IUser {
  username: string;
  fullname: string;
  role: 'admin' | 'teacher' | 'student' | 'user';
  isActive: boolean;
  email?: string;
}

export interface IUserCreate {
  username: string;
  fullname: string;
  email?: string;
  password: string;
  role?: 'admin' | 'teacher' | 'student' | 'user';
  isActive?: boolean;
}

export interface IUserUpdate {
  username?: string;
  fullname?: string;
  email?: string;
  role?: 'admin' | 'teacher' | 'student' | 'user';
  isActive?: boolean;
}

// Existing functions (enhanced)
export const apiListUsers = async (): Promise<IUser[]> => {
  const { data } = await api.get<{ users: IUser[] }>('/users');
  return data.users;
};

export const apiGetUserByUsername = async (username: string): Promise<IUser> => {
  const { data } = await api.get<{ user: IUser }>(`/users/${username}`);
  return data.user;
};

// NEW: Enhanced user management functions
export const apiCreateUser = async (userData: IUserCreate): Promise<IUser> => {
  const { data } = await api.post<{ user: IUser }>('/users', userData);
  return data.user;
};

export const apiUpdateUser = async (username: string, userData: IUserUpdate): Promise<IUser> => {
  const { data } = await api.put<{ user: IUser }>(`/users/${username}`, userData);
  return data.user;
};

export const apiDeleteUser = async (username: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/users/${username}`);
  return data;
};



export const apiToggleUserStatus = async (username: string): Promise<IUser> => {
  const { data } = await api.patch<{ user: IUser }>(`/users/${username}/status`);
  return data.user;
};

export const apiResetPassword = async (username: string, newPassword: string): Promise<{ success: boolean }> => {
  const { data } = await api.put<{ success: boolean }>(`/users/${username}/password`, { newPassword });
  return data;
};
