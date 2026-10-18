-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  number text NOT NULL,
  type_code text,
  related_invoice_id text,
  issue_date text,
  due_date text,
  currency text,
  buyer_name text,
  buyer_siren text,
  total_excl_vat numeric,
  total_vat numeric,
  total_incl_vat numeric,
  profile text,
  mode text,
  invoice jsonb,
  report jsonb,
  facturx_key text,
  facturx_sha256 text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS setup
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (true);
