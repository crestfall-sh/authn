-- "authenticator" role for postgrest
CREATE ROLE authenticator LOGIN NOINHERIT;

-- "anon" role for postgrest
CREATE ROLE anon NOLOGIN NOINHERIT;
ALTER ROLE anon SET statement_timeout = '5s';
GRANT USAGE ON SCHEMA public TO anon; -- schema-level permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon; -- grant for table-level, rls for row-level permissions
GRANT anon TO authenticator;

-- "authenticated" role for postgrest
CREATE ROLE authenticated NOLOGIN NOINHERIT;
ALTER ROLE authenticated SET statement_timeout = '5s';
GRANT USAGE ON SCHEMA public TO authenticated; -- schema-level permissions
GRANT USAGE ON SCHEMA extensions TO authenticated; -- schema-level permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated; -- table-level permissions
GRANT authenticated TO authenticator;
 
-- "private" schema
CREATE SCHEMA private;

-- "private.users" table
-- need to support the following: basic login, passwordless login
CREATE TABLE private.users (
    "id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    "email" text DEFAULT NULL,
    "email_verification_code" text DEFAULT NULL,
    "email_verified_at" timestamptz DEFAULT NULL,
    "email_recovery_code" text DEFAULT NULL,
    "email_recovered_at" timestamptz DEFAULT NULL,
    "phone" text DEFAULT NULL,
    "phone_verification_code" text DEFAULT NULL,
    "phone_verified_at" timestamptz DEFAULT NULL,
    "phone_recovery_code" text DEFAULT NULL,
    "phone_recovered_at" timestamptz DEFAULT NULL,
    "phone_recovery_code" text DEFAULT NULL,
    "password_salt" text DEFAULT NULL,
    "password_hash" text DEFAULT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT NULL,
    UNIQUE("email"),
    UNIQUE("phone")
);
ALTER TABLE private.users ENABLE ROW LEVEL SECURITY;

-- "private.sub()" function
CREATE OR REPLACE FUNCTION private.sub()
RETURNS uuid
LANGUAGE SQL STABLE
AS $$
	SELECT COALESCE(
		current_setting('request.jwt.claim.sub', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
	)::uuid
$$;

-- "private.role()" function
CREATE OR REPLACE FUNCTION private.role()
RETURNS text
LANGUAGE SQL STABLE
AS $$
	SELECT COALESCE(
		current_setting('request.jwt.claim.role', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'role')
	)::text
$$;

-- "private.email()" function
CREATE OR REPLACE FUNCTION private.email()
RETURNS text
LANGUAGE SQL STABLE
AS $$
	SELECT COALESCE(
		current_setting('request.jwt.claim.email', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'email')
	)::text
$$;