import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { 
            
            if (!user) 
              return; 

            switch (user.role) 
            { 
                case "admin":
                  navigate("/admin");
                  break;
                case "teacher":
                  navigate("/teacher");
                  break;
                case "student":
                  navigate("/student");
                  break;
                default:
                  navigate("/login");
            } 
        
        
        }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
          await login(username, password);




    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    }
  };

  // return (
  //   <div style={{ maxWidth: 360, margin: '2rem auto' }}>
  //     <h2>Login</h2>
  //     {error && <p style={{ color: 'crimson' }}>{error}</p>}
  //     <form onSubmit={handleSubmit}>
  //       <label>
  //         Username
  //         <input
  //           required
  //           value={username}
  //           onChange={e => setUsername(e.target.value)}
  //         />
  //       </label>
  //       <br />
  //       <label>
  //         Password
  //         <input
  //           type="password"
  //           required
  //           value={password}
  //           onChange={e => setPassword(e.target.value)}
  //         />
  //       </label>
  //       <br />
  //       <button type="submit">Sign in</button>
  //     </form>
  //   </div>
  // );


  return (
    <div className="max-w-sm mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && (
        <p className="text-red-600 mb-4 text-sm text-center">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-semibold transition-colors"
        >
          Sign in
        </button>
      </form>
    </div>
  );


}
