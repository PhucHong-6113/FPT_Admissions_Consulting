// Auth utility functions
export interface UserProfile {
  userId: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrorList?: any;
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('access_token');
  const expiration = localStorage.getItem('token_expiration');

  if (!token || !expiration) return false;

  const now = new Date().getTime();
  const expirationTime = parseInt(expiration);

  return now < expirationTime;
};

// Get stored access token
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Get all stored tokens
export const getTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;

  const access_token = localStorage.getItem('access_token');
  const token_type = localStorage.getItem('token_type');
  const expires_in = localStorage.getItem('expires_in');
  const refresh_token = localStorage.getItem('refresh_token');
  const scope = localStorage.getItem('scope');

  if (!access_token || !token_type || !expires_in || !refresh_token || !scope) {
    return null;
  }

  return {
    access_token,
    token_type,
    expires_in: parseInt(expires_in),
    refresh_token,
    scope
  };
};

// Fetch user profile from API
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch('http://localhost:5050/api/v1/User/SelectUserProfile', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const apiResponse: ApiResponse<UserProfile> = await response.json();

      // Check if API call was successful
      if (apiResponse.success && apiResponse.response) {
        const userProfile = apiResponse.response;
        // Store user profile in localStorage for quick access
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
        return userProfile;
      } else {
        console.error('API returned error:', apiResponse.message);
        return null;
      }
    } else {
      // Token might be expired or invalid
      logout();
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Get stored user profile
export const getStoredUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;

  const profile = localStorage.getItem('user_profile');
  if (!profile) return null;

  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
};

// Logout user
export const logout = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('expires_in');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('scope');
  localStorage.removeItem('token_expiration');
  localStorage.removeItem('user_profile');

  // Redirect to home page
  window.location.href = '/';
};

// Refresh token function (for future use)
export const refreshToken = async (): Promise<boolean> => {
  const tokens = getTokens();
  if (!tokens || !tokens.refresh_token) return false;

  try {
    const response = await fetch('http://localhost:5050/connect/Token', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
      })
    });

    if (response.ok) {
      const data = await response.json();

      // Store new tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('expires_in', data.expires_in.toString());
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('scope', data.scope);

      const expirationTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('token_expiration', expirationTime.toString());

      return true;
    } else {
      logout();
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return false;
  }
};
