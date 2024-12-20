import { useState } from "react";
import axios from "../utils/axios";
import { useRouter } from "next/router";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await axios.post("/register", { username, password });
      alert(response.data.message);
    } catch (error) {
      // @ts-expect-error onetuhnoeth
      setError(error.response.data.error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("/login", { username, password });
      localStorage.setItem("access_token", response.data.access_token);
      router.push("/profile");
    } catch (error) {
      // @ts-expect-error onetuhnoeth
      setError(error.response.data.error);
    }
  };

  return (
    <div>
      <h1>Login / Register</h1>
      {error && <p>{error}!!!</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
