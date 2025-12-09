-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin_settings table for auto-mode toggles
CREATE TABLE public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('auto_approve_items', false),
('auto_approve_claims', false);

-- Create claims table
CREATE TABLE public.claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    claimant_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    diu_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    proof_image TEXT,
    status public.item_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Anyone can insert claims
CREATE POLICY "Anyone can insert claims"
ON public.claims
FOR INSERT
WITH CHECK (true);

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
ON public.claims
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update claims
CREATE POLICY "Admins can update claims"
ON public.claims
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete claims
CREATE POLICY "Admins can delete claims"
ON public.claims
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update lost_items: change default status to pending
ALTER TABLE public.lost_items ALTER COLUMN status SET DEFAULT 'pending';

-- Update found_items: change default status to pending
ALTER TABLE public.found_items ALTER COLUMN status SET DEFAULT 'pending';

-- Add policies for admins to view all items (including pending)
CREATE POLICY "Admins can view all lost items"
ON public.lost_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lost items"
ON public.lost_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lost items"
ON public.lost_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all found items"
ON public.found_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update found items"
ON public.found_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete found items"
ON public.found_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for claim proof images
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-proofs', 'claim-proofs', true);

-- Storage policies for claim-proofs bucket
CREATE POLICY "Anyone can upload claim proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'claim-proofs');

CREATE POLICY "Anyone can view claim proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'claim-proofs');

-- Enable realtime for claims
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;