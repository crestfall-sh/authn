CREATE SCHEMA private;

CREATE TABLE private.users (
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    "password_salt" text DEFAULT NULL,
    "password_hash" text DEFAULT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT NULL,
    UNIQUE("email"),
    UNIQUE("phone")
);

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
