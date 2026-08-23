import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setSession = useAuthStore((s) => s.setSession);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    isAuthenticated,
    isLoading,
    setSession,
    updateUser,
    logout,
    phoneNumber: user?.phoneNumber ?? '',
    rewardPoints: user?.rewardPoints ?? 0,
    fullName: user?.fullName ?? '',
  };
};
