-- Fix: grant table permissions for authenticated users.
-- Required when "Automatically expose new tables" is disabled in Supabase.
-- Run in Supabase SQL Editor if you see "permission denied for table places".

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated, service_role;
