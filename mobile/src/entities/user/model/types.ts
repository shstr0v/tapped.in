export type UserGender = "female" | "male" | "other";
export type UserStatus = "active" | "guest";
export type OnboardingStatus = "completed" | "required";

export type UserAccount = {
  age: number | null;
  avatar_url: string | null;
  first_name: string | null;
  gender: UserGender | null;
  last_name: string | null;
  username: string | null;
};

export type User = {
  account: UserAccount | null;
  created_at: string;
  email: string | null;
  id: string;
  onboarding_status: OnboardingStatus;
  phone: string | null;
  status: UserStatus;
};

export type SignUpRequest = {
  age: number;
  avatar_url?: string | null;
  email: string;
  first_name: string;
  gender: UserGender;
  last_name: string;
  password: string;
  phone: string;
  telegram_id?: number | null;
  username?: string | null;
};

export type EmailLoginRequest = {
  email: string;
  password: string;
};

export type EmailCodeRequest = {
  email: string;
};

export type EmailCodeVerifyRequest = {
  code: string;
  email: string;
};

export type PhoneLoginRequest = {
  phone: string;
};

export type PhoneLoginVerifyRequest = {
  code: string;
  phone: string;
};

export type AuthSessionResponse = {
  sid: string;
  user: User;
};

export type CompleteUserRequest = {
  age: number;
  avatar_url?: string | null;
  first_name: string;
  gender: UserGender;
  last_name?: string | null;
  username: string;
};

export type UpdateUserRequest = {
  avatar_url?: string | null;
  first_name: string;
  gender: UserGender;
  last_name?: string | null;
  username: string;
};
