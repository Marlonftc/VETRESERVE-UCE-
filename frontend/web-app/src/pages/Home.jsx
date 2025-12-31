import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1>Authenticated User</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
