import { getLastAccessToken } from "@/lib/utils/refresh-token-store";

type AuthAwareState = { auth?: { accessToken?: string | null } };

export const prepareAuthHeaders = (
  headers: Headers,
  { getState }: { getState: () => unknown },
) => {
  const token =
    (getState() as AuthAwareState)?.auth?.accessToken || getLastAccessToken();

  if (token) {
    headers.set("authorization", `Bearer ${token.replace(/^Bearer\s+/i, "")}`);
  }
  return headers;
};
