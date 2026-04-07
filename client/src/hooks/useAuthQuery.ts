import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiLogin,
  apiRegister,
  apiGoogleSignIn,
  apiForgotPassword,
  apiVerifyOtp,
  apiSetNewPassword,
  apiLogout,
  apiFetchProfile,
  setTokens,
  clearTokens,
  getAccessToken,
  type AuthResponse,
} from "../services/auth.service";

const AUTH_KEYS = {
  user: ["auth", "user"] as const,
  profile: ["auth", "profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: apiFetchProfile,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

function handleAuthSuccess(
  data: AuthResponse,
  queryClient: ReturnType<typeof useQueryClient>
) {
  setTokens(data.accessToken, data.refreshToken);
  queryClient.setQueryData(AUTH_KEYS.profile, data.user);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: (data) => handleAuthSuccess(data, queryClient),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      email: string;
      full_name: string;
      password: string;
    }) => apiRegister(vars.email, vars.full_name, vars.password),
    onSuccess: (data) => handleAuthSuccess(data, queryClient),
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idToken: string) => apiGoogleSignIn(idToken),
    onSuccess: (data) => handleAuthSuccess(data, queryClient),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      clearTokens();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => apiForgotPassword(email),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      apiVerifyOtp(email, otp),
  });
}

export function useSetNewPassword() {
  return useMutation({
    mutationFn: ({
      email,
      newPassword,
    }: {
      email: string;
      newPassword: string;
    }) => apiSetNewPassword(email, newPassword),
  });
}
