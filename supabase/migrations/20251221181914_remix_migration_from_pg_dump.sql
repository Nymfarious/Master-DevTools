CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: api_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    vendor text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    auth_type text DEFAULT 'api-key'::text NOT NULL,
    purpose text,
    endpoint_url text,
    last_checked timestamp with time zone,
    response_time_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dev_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dev_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level text NOT NULL,
    message text NOT NULL,
    context jsonb,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pipeline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pipeline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    step text NOT NULL,
    provider text NOT NULL,
    duration_ms integer NOT NULL,
    success boolean DEFAULT true NOT NULL,
    asset_id text,
    metadata jsonb,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_registry api_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_registry
    ADD CONSTRAINT api_registry_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: dev_logs dev_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dev_logs
    ADD CONSTRAINT dev_logs_pkey PRIMARY KEY (id);


--
-- Name: pipeline_events pipeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipeline_events
    ADD CONSTRAINT pipeline_events_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: api_registry update_api_registry_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_api_registry_updated_at BEFORE UPDATE ON public.api_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: app_settings update_app_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: api_registry Admins can manage APIs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage APIs" ON public.api_registry USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: app_settings Admins can manage app settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage app settings" ON public.app_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dev_logs Admins can manage logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage logs" ON public.dev_logs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pipeline_events Admins can manage pipeline events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage pipeline events" ON public.pipeline_events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dev_logs Admins can view logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view logs" ON public.dev_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pipeline_events Admins can view pipeline events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view pipeline events" ON public.pipeline_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: api_registry Anyone can view APIs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view APIs" ON public.api_registry FOR SELECT USING (true);


--
-- Name: app_settings Anyone can view app settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: api_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: dev_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dev_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pipeline_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pipeline_events ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;