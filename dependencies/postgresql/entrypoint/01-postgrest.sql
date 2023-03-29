
-- PostgREST "authenticator" role
CREATE ROLE authenticator LOGIN NOINHERIT;

-- PostgREST "anon" role
CREATE ROLE anon NOLOGIN NOINHERIT;
ALTER ROLE anon SET statement_timeout = '5s';
GRANT anon TO authenticator;

-- PostgREST "authenticated" role
CREATE ROLE authenticated NOLOGIN NOINHERIT;
ALTER ROLE authenticated SET statement_timeout = '5s';
GRANT authenticated TO authenticator;

-- Example anon permissions:
-- Example schema-level permissions:
-- GRANT USAGE ON SCHEMA public TO anon;
-- Example table-level permissions:
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Example authenticated permissions:
-- Example schema-level permissions:
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- Example table-level permissions:
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
