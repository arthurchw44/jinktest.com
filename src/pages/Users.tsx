import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiListUsers } from '../api/apiUsers';

export default function Users() {
    const { data, error, isLoading } = useQuery({
    queryKey: ['users'],          // fetch all users
    queryFn: apiListUsers,
  });//useQuery(['users'], apiListUsers);

  if (isLoading) return <p>Loading users…</p>;
  if (error) return <p>Error loading users.</p>;

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {data!.map(u => (
          <li key={u.username}>
            <Link to={`/users/${u.username}`}>{u.fullname}</Link>
            &nbsp;<small>({u.role})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
