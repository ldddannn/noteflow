export interface User {
  id: number;
  account: string;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface RegisterPayload {
  account: string;
  username: string;
  email: string;
  password: string;
}
