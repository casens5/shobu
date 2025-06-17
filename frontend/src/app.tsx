import { AuthProvider } from "./authContext";
import Game from "./game/game";
import Header from "./header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col items-center justify-center sm:px-8 bg-zinc-800 text-zinc-50">
          <Header />
          <main className="flex h-full w-full flex-1 flex-col items-center text-xl">
            <Routes>
              <Route path="" element={<Game />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/game" element={<Game />} />
              {/*<Route path="/profile" element={<ProfilePage />} />*/}
            </Routes>
          </main>
          <footer className=""></footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
