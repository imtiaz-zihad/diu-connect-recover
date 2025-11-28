-- Enable realtime for lost_items and found_items tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.found_items;