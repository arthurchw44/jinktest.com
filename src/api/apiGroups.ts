// src/api/apiGroups.ts
import api from './axios';

export interface IStudentGroup {
  _id?: string;
  name: string;
  description?: string;
  teacherUsername: string;
  studentUsernames: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    grade?: string;
    subject?: string;
    academicYear?: string;
  };
}

export interface IGroupCreate {
  name: string;
  description?: string;
  metadata?: {
    grade?: string;
    subject?: string;
    academicYear?: string;
  };
}

export interface IGroupUpdate {
  name?: string;
  description?: string;
  metadata?: {
    grade?: string;
    subject?: string;
    academicYear?: string;
  };
}

export const apiListGroups = async (): Promise<IStudentGroup[]> => {
  const { data } = await api.get<{ groups: IStudentGroup[] }>('/groups');
  return data.groups;
};

export const apiCreateGroup = async (groupData: IGroupCreate): Promise<IStudentGroup> => {
  const { data } = await api.post<{ group: IStudentGroup }>('/groups', groupData);
  return data.group;
};

export const apiGetGroup = async (groupId: string): Promise<IStudentGroup> => {
  const { data } = await api.get<{ group: IStudentGroup }>(`/groups/${groupId}`);
  return data.group;
};

export const apiUpdateGroup = async (groupId: string, groupData: IGroupUpdate): Promise<IStudentGroup> => {
  const { data } = await api.put<{ group: IStudentGroup }>(`/groups/${groupId}`, groupData);
  return data.group;
};

export const apiDeleteGroup = async (groupId: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/groups/${groupId}`);
  return data;
};

export const apiManageGroupMembers = async (
  groupId: string, 
  memberData: { add?: string[], remove?: string[] }
): Promise<IStudentGroup> => {
  const { data } = await api.put<{ group: IStudentGroup }>(`/groups/${groupId}/members`, memberData);
  return data.group;
};
