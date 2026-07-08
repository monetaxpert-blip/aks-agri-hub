import { createServerFn } from "@tanstack/react-start";

/**
 * Admin bootstrap — DISABLED in production.
 *
 * The initial admin has been created. This endpoint is now closed to prevent
 * anonymous callers from probing whether an admin exists or attempting a
 * password reset via the ADMIN_INIT_PASSWORD secret.
 *
 * To rotate the admin credential:
 *   1. Update the ADMIN_INIT_PASSWORD secret in Lovable Cloud.
 *   2. Temporarily set BOOTSTRAP_ADMIN_TOKEN and pass it in the request body.
 *   3. Remove BOOTSTRAP_ADMIN_TOKEN once done.
 */
export const initializeAdmin = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => {
    const obj = (i ?? {}) as { token?: string };
    return { token: typeof obj.token === "string" ? obj.token : "" };
  })
  .handler(async ({ data }) => {
    const gate = process.env.BOOTSTRAP_ADMIN_TOKEN;
    if (!gate || gate.length < 16 || data.token !== gate) {
      return { ok: false as const, error: "Endpoint désactivé." };
    }

    const password = process.env.ADMIN_INIT_PASSWORD;
    if (!password || password.length < 8) {
      return { ok: false as const, error: "ADMIN_INIT_PASSWORD manquant." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = "agrokonnectesenegal@gmail.com";
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existingUser = userList?.users.find((u) => u.email === email);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
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
