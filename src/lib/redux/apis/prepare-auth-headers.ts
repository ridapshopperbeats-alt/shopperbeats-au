export const prepareAuthHeaders = (
  headers: Headers,
  { getState }: { getState: () => unknown },
) => {
  const state = getState() as { auth?: { accessToken?: string | null } };
  const token = state.auth?.accessToken;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};
