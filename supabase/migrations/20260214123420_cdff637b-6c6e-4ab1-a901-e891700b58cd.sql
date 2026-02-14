
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  referrer TEXT
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert visits" ON public.site_visits FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all visits" ON public.site_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
