export type UserRole = 'fisherman' | 'admin' | 'researcher';

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
