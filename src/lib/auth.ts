import { NextRequest } from "next/server";

/**
 * Admin auth — disabled for standalone use.
 * This blog system runs without authentication.
 * For production, implement proper auth (NextAuth, Clerk, etc.)
 */
export function verifyAdmin(_request: NextRequest): boolean {
  return true; // No auth — standalone mode
}
