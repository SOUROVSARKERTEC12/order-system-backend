import { Role } from "../enums/user.enums";

export interface RegisterResponse {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: RegisterResponse;
}

