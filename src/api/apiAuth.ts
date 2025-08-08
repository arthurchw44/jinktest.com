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


export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const apiChangeOwnPassword = async (payload: ChangePasswordRequest) => {
  // The endpoint and HTTP method are typical for this operation
  const { data } = await api.put<ChangePasswordResponse>(
    '/auth/password',
    payload
  );
  return data;
};

// Add this interface at the top with other interfaces
export interface LogoutAllResponse {
  success: boolean;
  message: string;
}

// Add this function after existing functions
export const apiLogoutAll = async (): Promise<LogoutAllResponse> => {
  const { data } = await api.post<LogoutAllResponse>('/auth/logout-all');
  return data;
};


// Add this interface at the top with other interfaces
export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Add this function after existing functions
export const apiLogout = async (): Promise<LogoutResponse> => {
  const { data } = await api.post<LogoutResponse>('/auth/logout');
  return data;
};