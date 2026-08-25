import { createContext } from "react";

/**
 * @typedef {{
 *   user: import("@supabase/supabase-js").User | null,
 *   loading: boolean,
 *   signIn: (email: string, password: string) => Promise<void>,
 *   signOut: () => Promise<void>,
 * }} AuthContextValue
 */

/** @type {import("react").Context<AuthContextValue | null>} */
export const AuthContext = createContext(null);
