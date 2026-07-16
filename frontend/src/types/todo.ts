export interface Todo {
  id: number;
  title: string;
  status: "pending" | "done";
  created_at: string;
  updated_at: string;
}

export interface TodoPayload {
  title: string;
  status?: "pending" | "done";
}
