-- ============================================================
-- AuraCV — storage policies (run AFTER creating the buckets)
--
-- Buckets "resume" and "auracv" are created in the Dashboard UI
-- (Storage -> New bucket, toggle "Public").
--
-- The app needs all four policies because the avatar upload uses
-- { upsert: true }: overwriting an existing object requires the
-- existing row to be SELECT-able and UPDATE/DELETE-able, not just
-- the INSERT permission.
--
-- If this script fails with "must be owner of table objects",
-- create the same policies via the UI instead:
--   Storage -> Policies -> storage.objects -> New policy
-- ============================================================

drop policy if exists "Authenticated uploads" on storage.objects;
create policy "Authenticated uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('resume', 'auracv'));

drop policy if exists "Authenticated read uploads" on storage.objects;
create policy "Authenticated read uploads"
  on storage.objects for select to authenticated
  using (bucket_id in ('resume', 'auracv'));

drop policy if exists "Authenticated overwrite own uploads" on storage.objects;
create policy "Authenticated overwrite own uploads"
  on storage.objects for update to authenticated
  using (bucket_id in ('resume', 'auracv'))
  with check (bucket_id in ('resume', 'auracv'));

drop policy if exists "Authenticated delete uploads" on storage.objects;
create policy "Authenticated delete uploads"
  on storage.objects for delete to authenticated
  using (bucket_id in ('resume', 'auracv'));
