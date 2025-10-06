'use server';

import { createServerClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface LoginState {
  message?: string;
}

const ERROR_GENERIC = "Could not authenticate user";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createServerClient({ allowCookieWrite: true });

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { message: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message || ERROR_GENERIC };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
