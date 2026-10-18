-- Create folders table
CREATE TABLE public.folders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    parent_id uuid REFERENCES public.folders(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS setup for folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own folders"
    ON public.folders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add folder_id to invoices
ALTER TABLE public.invoices ADD COLUMN folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL;
