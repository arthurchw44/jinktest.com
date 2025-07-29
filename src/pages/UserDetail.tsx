import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGetUserByUsername } from '../api/apiUsers';

export default function UserDetail() {
  const { username } = useParams<{ username: string }>();


  // const {
  //   data: user,
  //   error,
  //   isLoading,
  // } = useQuery(['user', username], () => apiGetUserByUsername(username!), {
  //   enabled: !!username,
  // });
  const {
      data: user,
      error,
      isLoading,
  } = useQuery({
      queryKey: ['user', username],
      queryFn: () => apiGetUserByUsername(username!),
      enabled: !!username,
  });


  if (isLoading) return <p>Loading profile…</p>;
  if (error) return <p>Error fetching user.</p>;

  return (
    <div>
      <h2>{user!.fullname}</h2>
      <p>
        <b>Username:</b> {user!.username}
      </p>
      <p>
        <b>Role:</b> {user!.role}
      </p>
      <p>
        <b>Status:</b> {user!.isActive ? 'Active' : 'Inactive'}
      </p>
    </div>
  );
}
