
ALTER TABLE public.notifications ADD COLUMN key TEXT;
CREATE UNIQUE INDEX notifications_user_key_idx ON public.notifications (user_id, key) WHERE key IS NOT NULL;
