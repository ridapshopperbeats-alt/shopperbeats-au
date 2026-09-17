export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  authChecked: boolean;
}

export interface UserDetails {
  response: {
    id: string;
    name: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phonenumber?: string | null;
    date_of_birth?: string | null;
    profile_image?: string | null;
  };
}

export interface PersonalData {
  response: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phonenumber: string;
    date_of_birth?: null | string;
    profile_image?: string | null;
  };
}

export interface PersonalInfoFormData {
  first_name: string;
  last_name: string;
  email: string;
  phonenumber: string;
  date_of_birth?: null | string;
  profile_image?: File | string | null;
}


export interface LoginResponse {
  response: {
    user: User;
    refresh_token: string;
    access_token: string;
  };
}

export interface UpdatePersonalDataRequest {
  first_name: string;
  last_name: string;
  email: string;
  phonenumber: string;
  date_of_birth?: string | null;
  profile_image?: File | string | null;
}

export interface SocialMediaLink {
  id: number;
  platform: string;
  url: string;
  icon_class: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}