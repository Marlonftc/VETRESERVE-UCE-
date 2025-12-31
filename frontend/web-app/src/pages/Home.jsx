import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <>
      <h1>Client Home</h1>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
