import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

/**
 * Single-admin auth.
 *
 * There is one administrator and no user table, so the credential is a bcrypt
 * hash in the environment and the session is a signed, httpOnly cookie. The
 * old site kept the password in client-side JavaScript as well as the README;
 * nothing here is readable by the browser.
 */
const COOKIE = "hl_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to at least 32 characters. See .env.example.",
    );
  }
  return new TextEncoder().encode(s);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** True when the caller holds a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Use at the top of every admin-only route handler. */
export async function requireAdmin(): Promise<Response | null> {
  return (await isAdmin())
    ? null
    : Response.json({ error: "Unauthorised" }, { status: 401 });
}
