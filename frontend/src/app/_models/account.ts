import { Role } from "./role";

export interface Account {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: string;
  employeeId?: number;  // Optional employee ID for users
  jwtToken?: string;
}