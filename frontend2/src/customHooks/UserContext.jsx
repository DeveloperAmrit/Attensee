import { createContext, useReducer, useContext, useEffect } from 'react';
import { APIBase } from '../data/data';

export function fetchUser(dispatch) {
  console.log("Fetching user...");
  async function fetchUser_(dispatch) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${APIBase}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      console.log("User data:", data.user);
      dispatch({ type: "login", user: data.user });
    } catch (err) {
      console.error("Auto-login failed:", err);
    }
  }

  fetchUser_(dispatch);
}

const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

export function UserProvider({ children }) {
  const [User, dispatch] = useReducer(UserReducer, loadInitialUser());

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(User));
  }, [User]);

  useEffect(() => {
    fetchUser(dispatch);
  },[]);

  return (
    <UserContext.Provider value={User}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}

export function useUserDispatchContext() {
  return useContext(UserDispatchContext);
}

function UserReducer(user, action) {
  switch (action.type) {
    case 'login': {
      return {
        ...action.user,
      };
    }
    case 'logout': {
      localStorage.setItem('user', JSON.stringify(initialUser));
      return initialUser;
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

function loadInitialUser() {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) : initialUser;
}

const initialUser = {
  userId: '',
  username: '',
  passwordHash: '',
  name: '',
  email: '',
  role: '',
};
