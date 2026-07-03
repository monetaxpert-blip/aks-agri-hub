-- Avatars: owner writes, owner+admin read
CREATE POLICY "avatars_owner_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')))
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Annonces: owner writes, owner+admin read
CREATE POLICY "annonces_owner_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'annonces' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')))
WITH CHECK (bucket_id = 'annonces' AND auth.uid()::text = (storage.foldername(name))[1]);