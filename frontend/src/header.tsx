import { Link } from "react-router-dom";
import { useAuth } from "./authContext";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sm:text-xl flex w-full justify-between flex-row xs:p-2 sm:p-4">
      <Link to="/game">shobu</Link>
      <div className="flex flex-row gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/profile">{user!.username}</Link>
            <button onClick={() => logout()}>logout</button>
          </>
        ) : (
          <Link to="/login">login</Link>
        )}
      </div>
    </header>
  );
}
