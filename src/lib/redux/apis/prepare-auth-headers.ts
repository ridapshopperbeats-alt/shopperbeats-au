import { getLastAccessToken } from "@/lib/utils/refresh-token-store";

/**
 * Structural shape rather than an import of RootState: store.ts pulls in the
 * API slices, which reach back here, and that cycle leaves the type undefined
 * at module init.
 */
type AuthAwareState = { auth?: { accessToken?: string | null } };

/**
 * The API lives on a different origin, so the SameSite=Strict access_token
 * cookie is never attached to these requests. Take the token from the store —
 * that is where login, google-login and the refresh flow all put it — and fall
 * back to the copy the last refresh persisted, which survives a reload before
 * the store has rehydrated.
 */
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
