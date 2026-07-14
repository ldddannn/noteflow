"use client";

import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";

interface User {
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
