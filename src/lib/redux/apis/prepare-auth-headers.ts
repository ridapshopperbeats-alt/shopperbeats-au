import { getAccessTokenCookie } from "@/lib/utils/access-token";

export const prepareAuthHeaders = (headers: Headers) => {
  const token = getAccessTokenCookie();
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};
