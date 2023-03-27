
-- https://www.postgresql.org/docs/14/functions-json.html
-- https://www.postgresql.org/docs/14/functions-aggregate.html
-- https://www.postgresql.org/docs/14/plpgsql-errors-and-messages.html

-- "public.users" table
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  "id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "email" text NOT NULL
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- "public.roles" table
DROP TABLE IF EXISTS public.roles CASCADE;
CREATE TABLE public.roles (
  "id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "name" text NOT NULL
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- "public.permissions" table
DROP TABLE IF EXISTS public.permissions CASCADE;
CREATE TABLE public.permissions (
  "id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "role_id" uuid REFERENCES public.roles NOT NULL,
  "scopes" text[] NOT NULL, -- authz:read, authz:write
  "description" text NOT NULL -- Crestfall Authorization for Administrators
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS public.assignments CASCADE;
CREATE TABLE public.assignments (
  "id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "user_id" uuid REFERENCES public.users NOT NULL,
  "role_id" uuid REFERENCES public.roles NOT NULL,
  "assigned_by_user_id" uuid REFERENCES public.users DEFAULT NULL,
  "assigned_at" timestamptz DEFAULT now(),
  UNIQUE("user_id", "role_id")
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- FUNCTION public.is_authorized(user_id, scope)
CREATE FUNCTION public.is_authorized (
  param_user_id uuid,
  param_scope text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result boolean;
BEGIN
  SELECT 1 INTO result FROM public.assignments
  WHERE public.assignments.user_id = param_user_id
  AND EXISTS (
      SELECT 1 FROM public.permissions
      WHERE public.permissions.role_id = public.assignments.role_id
      AND param_scope = ANY(public.permissions.scopes)
  );
  result = COALESCE(result, false);
  return result;
END;
$$;

-- POLICY for public.users SELECT
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users AS PERMISSIVE
FOR SELECT TO authenticated USING (
  users.id = private.sub()
  OR is_authorized(private.sub(), 'authz:read') = true
);

-- POLICY for public.roles SELECT
DROP POLICY IF EXISTS roles_select ON public.roles;
CREATE POLICY roles_select ON public.roles AS PERMISSIVE
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM assignments
    WHERE assignments.role_id = roles.id
    AND assignments.user_id = private.sub()
  )
  OR is_authorized(private.sub(), 'authz:read') = true
);

-- POLICY for public.permissions SELECT
DROP POLICY IF EXISTS permissions_select ON public.permissions;
CREATE POLICY permissions_select ON public.permissions AS PERMISSIVE
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM roles
    WHERE roles.id = permissions.role_id
    AND EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.role_id = roles.id
      AND assignments.user_id = private.sub()
    )
  )
  OR is_authorized(private.sub(), 'authz:read') = true
);

-- POLICY for public.assignments SELECT
DROP POLICY IF EXISTS assignments_select ON public.assignments;
CREATE POLICY assignments_select ON public.assignments AS PERMISSIVE
FOR SELECT TO authenticated USING (
  assignments.user_id = private.sub()
  OR is_authorized(private.sub(), 'authz:read') = true
);

-- POLICY for public.assignments INSERT
DROP POLICY IF EXISTS assignments_insert ON public.assignments;
CREATE POLICY assignments_insert ON public.assignments AS PERMISSIVE
FOR INSERT TO authenticated WITH CHECK (
  is_authorized(private.sub(), 'authz:write') = true
);

-- POLICY for public.assignments DELETE
DROP POLICY IF EXISTS assignments_delete ON public.assignments;
CREATE POLICY assignments_delete ON public.assignments AS PERMISSIVE
FOR DELETE TO authenticated USING (
  is_authorized(private.sub(), 'authz:write') = true
);

-- FUNCTION for private.users AFTER INSERT
CREATE FUNCTION public.auth_users_after_insert_function ()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
begin
  INSERT INTO public.users ("id", "email")
  VALUES (new.id, new.email);
  return new;
end;
$$;

-- TRIGGER for private.users AFTER INSERT
CREATE TRIGGER auth_users_after_insert_trigger
AFTER INSERT ON private.users
FOR EACH ROW EXECUTE PROCEDURE public.auth_users_after_insert_function();

-- INSERT private.users INTO public.users
INSERT INTO public.users
SELECT "id", "email" FROM private.users;

-- INSERT roles administrator, moderator
INSERT INTO public.roles ("name")
VALUES ('administrator'), ('moderator');

-- INSERT permissions administrator authz read, write
INSERT INTO public.permissions ("role_id", "scopes", "description")
VALUES (
  (SELECT "id" FROM public.roles WHERE "name" = 'administrator'),
  ARRAY['authz:read', 'authz:write']::text[],
  'Crestfall Authorization for Administrators'
);

-- INSERT permissions moderator authz read
INSERT INTO public.permissions ("role_id", "scopes", "description")
VALUES (
  (SELECT "id" FROM public.roles WHERE "name" = 'moderator'),
  ARRAY['authz:read']::text[],
  'Crestfall Authorization for Moderators'
);

-- INSERT assignments admin@local.host administrator
INSERT INTO public.assignments ("user_id", "role_id")
VALUES (
  (SELECT "id" FROM public.users WHERE "email" = 'admin@local.host'),
  (SELECT "id" FROM public.roles WHERE "name" = 'administrator')
);

SELECT
  "email",
  is_authorized("id", 'authn:read') as authn_read,
  is_authorized("id", 'authn:write') as authn_write,
  is_authorized("id", 'authz:read') as authz_read,
  is_authorized("id", 'authz:write') as authz_write
FROM public.users;
