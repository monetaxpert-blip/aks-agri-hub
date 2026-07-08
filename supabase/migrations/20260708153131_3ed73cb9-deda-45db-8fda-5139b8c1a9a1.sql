
REVOKE EXECUTE ON FUNCTION public.annonces_guard_owner_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_guard_owner_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
