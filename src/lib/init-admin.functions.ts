import { createServerFn } from "@tanstack/react-start";

/**
 * Idempotent admin bootstrap. Callable by anyone but only creates an admin
 * account if NONE exists yet. The email is fixed and the password comes from
 * the ADMIN_INIT_PASSWORD env var. Once created, subsequent calls do nothing.
 */
export const initializeAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const password = process.env.ADMIN_INIT_PASSWORD;
  if (!password || password.length < 8) {
    return { ok: false as const, error: "ADMIN_INIT_PASSWORD manquant ou trop court côté serveur." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Check if any admin already exists
  const { data: existing } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin").limit(1);
  if (existing && existing.length > 0) {
    return { ok: false as const, error: "Un administrateur existe déjà." };
  }

  const email = "agrokonnectesenegal@gmail.com";

  // Try to find user by email (in case account created but role missing)
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existingUser = userList?.users.find((u) => u.email === email);

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    // Reset password to match secret
    await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom: "Admin", nom: "AKS" },
    });
    if (error || !created.user) return { ok: false as const, error: error?.message ?? "Création échouée" };
    userId = created.user.id;
  }

  await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  await supabaseAdmin.from("admin_audit_log").insert({
    admin_id: userId, action: "admin_bootstrap", metadata: { email },
  });

  return { ok: true as const, email };
});
