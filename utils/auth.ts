import {SERVICE_URLS} from "@/utils/services";

export interface UserProfile {
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

export function getStoredUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const profile = localStorage.getItem('user_profile');
  if (!profile) return null;
  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  // Lấy user_profile từ localStorage (giả lập fetch từ API)
  return getStoredUserProfile();
}

export function storeUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_profile');
  window.location.href = '/login';
}

export async function fetchUserProfileFromApi(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return null;
  try {
    const response = await fetch(`${SERVICE_URLS.AuthService}/api/v1/User/SelectUserProfile`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.success && data.response) {
      // Lưu user_profile vào localStorage
      localStorage.setItem('user_profile', JSON.stringify(data.response));
      return data.response;
    }
    return null;
  } catch {
    return null;
  }
}
