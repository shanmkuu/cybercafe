-- Create backups table for system backup tracking
CREATE TABLE public.backups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  started_at timestamp without time zone NOT NULL DEFAULT now(),
  completed_at timestamp without time zone,
  status text NOT NULL DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'failed'::text])),
  backup_size bigint DEFAULT 0,
  file_count integer DEFAULT 0,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT backups_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create index for faster lookups by status
CREATE INDEX idx_backups_status ON public.backups (status);

-- Create index for faster lookups by started_at
CREATE INDEX idx_backups_started_at ON public.backups (started_at DESC);
