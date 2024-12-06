export const APP_TITLE = "Vishwas";
export const DATABASE_PREFIX = "vishwas";
export const EMAIL_SENDER = '"Vishwas" <noreply@vishwas.com>';

export enum Paths {
  Home = "/",
  Login = "/login",
  Signup = "/signup",
  Dashboard = "/dashboard",
  VerifyEmail = "/verify-email",
  ResetPassword = "/reset-password",
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_SPEAKERS = 2;
