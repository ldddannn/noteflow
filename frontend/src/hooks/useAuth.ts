"use client";

import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";

interface User {
  account: string;
  username: string;
  email: string;
  avatar: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
