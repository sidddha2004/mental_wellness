"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  name: string;
};

const USER_STORAGE_KEY = "zenith-user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const userItem = localStorage.getItem(USER_STORAGE_KEY);
      if (userItem) {
        setUser(JSON.parse(userItem));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (name: string) => {
      const userData = { name };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      router.push("/auth");
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, [router]);

  // Effect to protect routes
  useEffect(() => {
    if (!loading && !user && pathname === '/dashboard') {
        router.push('/auth');
    }
  }, [user, loading, pathname, router]);


  return { user, login, logout, loading };
}
