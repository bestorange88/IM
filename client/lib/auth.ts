import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth-token")
  );
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          setToken(null);
          return null;
        }
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
  });

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    setToken(null);
    queryClient.clear();
  };

  useEffect(() => {
    const handleTokenChange = () => {
      const newToken = localStorage.getItem("auth-token");
      setToken(newToken);
    };

    window.addEventListener("storage", handleTokenChange);
    return () => window.removeEventListener("storage", handleTokenChange);
  }, []);

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!token && !!user,
    logout,
  };
}
