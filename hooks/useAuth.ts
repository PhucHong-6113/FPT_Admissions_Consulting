import { useState, useEffect } from 'react';
import {
  isAuthenticated,
  getStoredUserProfile,
  fetchUserProfile,
  logout,
  startTokenRefreshMonitor,
  stopTokenRefreshMonitor,
  isTokenExpiringSoon,
  refreshToken,
  UserProfile
} from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          setAuthenticated(true);

          // Start token refresh monitoring
          startTokenRefreshMonitor();

          // Check if token is expiring soon and refresh if needed
          if (isTokenExpiringSoon()) {
            console.log('Token expiring soon, refreshing...');
            await refreshToken();
          }

          // Try to get cached user profile first
          const cachedProfile = getStoredUserProfile();
          if (cachedProfile) {
            setUser(cachedProfile);
          }

          // Fetch fresh user profile
          const profile = await fetchUserProfile();
          if (profile) {
            setUser(profile);
          } else {
            // If we can't fetch profile, user might not be authenticated
            setAuthenticated(false);
            setUser(null);
          }
        } else {
          setAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      stopTokenRefreshMonitor();
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
  };

  return {
    user,
    loading,
    authenticated,
    logout: handleLogout,
    refreshUserProfile: async () => {
      const profile = await fetchUserProfile();
      if (profile) {
        setUser(profile);
      }
      return profile;
    }
  };
};
