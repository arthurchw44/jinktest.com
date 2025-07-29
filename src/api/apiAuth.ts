import api from './axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  fullname: string;
  role: 'admin' | 'teacher' | 'user' | 'student';
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserResponse;
}

export const apiLogin = async (payload: LoginRequest) => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const apiGetProfile = async () => {
  const { data } = await api.get<{ success: boolean; user: UserResponse }>(
    '/auth/profile'
  );
  return data.user;
};
