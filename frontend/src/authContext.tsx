import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(
  null as unknown as AuthContextType,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

type User = {
  username: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const response = await fetch("/api/status", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.logged_in) {
        setUser({ username: data.username });
      }
    } catch (error) {
      console.error("auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    username: string,
    password: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser({ username });
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  }

  async function register(
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // auto-login after registration
      return await login(username, password);
    } else {
      return { success: false, error: data.error };
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
