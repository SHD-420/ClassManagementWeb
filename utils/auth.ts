import { create, verify } from "$djwt";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import { User } from "../db/models/user.ts";

export type JWTPayload = Pick<User, "name" | "id">;

const jwtKey = await crypto.subtle.generateKey(
  {
    name: "HMAC",
    hash: "SHA-512",
  },
  true,
  ["sign", "verify"],
);

const JWT_EXPIRE_DURATION = 6 * 60 * 60 * 1000; // 6 hrs

/**
 * Get headers required to login the provided user
 */
export const login = async (user: JWTPayload, url: URL) => {
  const jwt = await create(
    {
      alg: "HS512",
      typ: "JWT",
    },
    {
      exp: Date.now() + JWT_EXPIRE_DURATION,
      user: {
        id: user.id,
        name: user.name,
      },
    },
    jwtKey,
  );

  // add the jwt to cookies
  const headers = new Headers();
  setCookie(headers, {
    name: "auth",
    value: jwt,
    maxAge: JWT_EXPIRE_DURATION,
    sameSite: "Strict",
    domain: url.hostname,
    path: "/",
    secure: true,
  });

  // redirect to dashboard after login
  headers.set("location", "/app/dashboard");
  return headers;
};

/**
 * Get user (jwt payload) from request cookies
 */
export const getUserFromReq = async (req: Request) => {
  try {
    const authCookie = getCookies(req.headers).auth;
    if (!authCookie) return null;

    const { user } = await verify(authCookie, jwtKey);
    if (user && typeof user === "object") {
      return user as JWTPayload;
    }

    return null;
  } catch {
    return null;
  }
};
