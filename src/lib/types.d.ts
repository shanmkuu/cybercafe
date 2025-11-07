// Optional TypeScript declarations for Supabase helpers
// This file is intentionally minimal because the project is JS-based.

declare module 'supabase-helpers' {
  export function signUp(opts: any): Promise<any>;
  export function signIn(opts: any): Promise<any>;
}
