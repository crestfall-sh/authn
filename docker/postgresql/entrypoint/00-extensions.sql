-- Extensions
CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgaudit" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Automatic Schema Cache Reloading: event function
-- https://postgrest.org/en/stable/schema_cache.html#schema-reloading
CREATE OR REPLACE FUNCTION public.pgrst_watch() RETURNS event_trigger LANGUAGE plpgsql AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Automatic Schema Cache Reloading: trigger function every ddl_command_end event
-- https://postgrest.org/en/stable/schema_cache.html#schema-reloading
CREATE EVENT TRIGGER pgrst_watch_event_trigger ON ddl_command_end EXECUTE PROCEDURE public.pgrst_watch();

-- test unaccent:
-- todo:
-- [x] lower-case
-- [x] normalize NFKC
-- [x] unaccent / case-fold
-- [x] regex validate for username / email
SELECT
  lower('Maße'),
  lower('Hôtel'),
  lower(normalize(extensions.unaccent('Maße'), NFKC)),
  lower(normalize(extensions.unaccent('Hôtel'), NFKC)),
  lower(normalize(extensions.unaccent('Maße@gmail.com'), NFKC)) ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' as "Maße@gmail.com",
  lower(normalize(extensions.unaccent('Hôtel@gmail.com'), NFKC)) ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' as "Hôtel@gmail.com",
  lower(normalize(extensions.unaccent('example @gmail.com'), NFKC)) ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' as "example @gmail.com",
  lower(normalize(extensions.unaccent('example@gmail.com'), NFKC)) ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' as "example@gmail.com";

-- test uuid-ossp:
SELECT extensions.uuid_generate_v4();

-- test pgjwt:
SELECT extensions.sign('{"sub":"1234567890","name":"John Doe","admin":true}', 'secret', 'HS256');

-- test pgsodium:
SELECT * FROM pgsodium.crypto_box_new_keypair();

-- test pgsodium:
SELECT
	"password"::text,
  "salt"::text,
  pgsodium.crypto_pwhash("password", "salt")::text as "hash"
FROM (SELECT 'password'::bytea as "password", pgsodium.crypto_pwhash_saltgen() as "salt") as table_one;

-- test pgsodium, expected hash: \x970d0e80120556642c641d67fea013ba3b8d249d041e92e1550220a6061dc457
SELECT
	"password"::text,
  "salt"::text,
  pgsodium.crypto_pwhash("password", "salt")::text as "hash"
FROM (SELECT 'password'::bytea as "password", '\x15708e9a39491dda0f3fd181cf09d886'::bytea as "salt") as table_one;

-- test http:
SELECT (unnest(headers)).* FROM extensions.http_get('https://example.com/');