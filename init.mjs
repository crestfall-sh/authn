// @ts-check

import postgres from 'postgres';

const sql = postgres({ username: 'postgres', password: 'wrongpass' });

{
  const response = await sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `;
  console.log({ response });
}

{
  const response = await sql`
    SELECT uuid_generate_v4();
  `;
  console.log({ response });
}

{
  const response = await sql`
    CREATE TABLE "users" (
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
  `;
  console.log({ response });
}

