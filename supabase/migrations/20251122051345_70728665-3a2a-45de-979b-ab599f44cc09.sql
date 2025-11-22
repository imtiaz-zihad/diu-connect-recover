-- Create enum for item categories
CREATE TYPE item_category AS ENUM ('ID Card', 'Electronics', 'Bag', 'Wallet', 'Others');

-- Create enum for item status
CREATE TYPE item_status AS ENUM ('pending', 'approved');

-- Create lost_items table
CREATE TABLE public.lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  category item_category NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  image text,
  status item_status DEFAULT 'approved',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create found_items table
CREATE TABLE public.found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  category item_category NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  image text,
  status item_status DEFAULT 'approved',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view approved items
CREATE POLICY "Anyone can view approved lost items"
  ON public.lost_items
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can view approved found items"
  ON public.found_items
  FOR SELECT
  USING (status = 'approved');

-- Allow anyone to insert items (they'll be auto-approved for now)
CREATE POLICY "Anyone can insert lost items"
  ON public.lost_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert found items"
  ON public.found_items
  FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload item images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'item-images');

-- Allow anyone to view item images
CREATE POLICY "Anyone can view item images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'item-images');

-- Create indexes for better query performance
CREATE INDEX idx_lost_items_category ON public.lost_items(category);
CREATE INDEX idx_lost_items_date ON public.lost_items(date);
CREATE INDEX idx_lost_items_created_at ON public.lost_items(created_at DESC);
CREATE INDEX idx_found_items_category ON public.found_items(category);
CREATE INDEX idx_found_items_date ON public.found_items(date);
CREATE INDEX idx_found_items_created_at ON public.found_items(created_at DESC);