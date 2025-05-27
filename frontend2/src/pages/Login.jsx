import React, { useState } from 'react';
import { useUserDispatchContext } from '../customHooks/UserContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/shared/Loading';
import { APIBase } from '../data/data';

export default function Login() {
  const dispatch = useUserDispatchContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({username: '', password: ''});


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`${APIBase}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (response.ok) {
      localStorage.setItem('token', res.token);
      dispatch({ type: 'login', user: res.user });
      navigate('/');
    } else {
      alert(res.message);
      navigate('/login');
    }
    setLoading(false);
  }

  if(loading) return <Loading/>;  

return (
  <div className="min-h-screen flex items-center justify-center transition-colors duration-500 dark:bg-gray-900 bg-gray-200">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700/50">
      <h2 className="text-3xl font-bold mb-4 text-center dark:text-white animate-fadeIn">
        Welcome
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-fadeIn">
        Log in to your account to continue.
      </p>
      <div className="w-full text-center text-black dark:text-white">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 ease-in-out dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Log In
          </button>
      </div>
    </div>
  </div>
);
}
