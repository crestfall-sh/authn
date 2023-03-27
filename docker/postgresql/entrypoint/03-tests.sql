-- http://localhost:5433/rpc/add_them?a=1&b=2
-- https://postgrest.org/en/stable/api.html#stored-procedures
CREATE FUNCTION add_them(a integer, b integer)
    RETURNS integer AS $$
    SELECT a + b;
$$ LANGUAGE SQL IMMUTABLE;

-- create public.tasks table, http://0.0.0.0:5433/tasks
CREATE TABLE public.tasks (
	"id" uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
	"description" text NOT NULL
);
INSERT INTO public.tasks ("description") VALUES
	('Paint a self-portrait.'),
	('Build a house.');