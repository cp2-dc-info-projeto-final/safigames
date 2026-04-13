export interface User {
  id: number;
  login: string;
  email: string;
  role: string;
}

export interface UserFormData {
  id: number;
  login: string;
  email: string;
  senha?: string;
  role: string;
}
