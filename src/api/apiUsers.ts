import api from './axios';
import type { UserResponse } from './apiAuth';

export const apiListUsers = async () => {
  const { data } = await api.get<{ users: UserResponse[] }>('/users');
  return data.users;
};

export const apiGetUserByUsername = async (username: string) => {
  const { data } = await api.get<{ user: UserResponse }>(`/users/${username}`);
  return data.user;
};
