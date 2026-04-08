export type UserRole = 'fisherman' | 'admin' | 'researcher';

// Matches the full database row shape
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// Full DB-row shape (used for admin/data fetch contexts)
export interface UserProfile {
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
