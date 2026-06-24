
CREATE OR REPLACE FUNCTION public.get_my_claimed_leads()
RETURNS TABLE (
  lead_id uuid,
  status lead_status,
  credits_cost integer,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone,
  notes text,
  contract_id uuid,
  contract_name text,
  supplier_name text,
  description text,
  start_date date,
  end_date date,
  monthly_cost numeric,
  yearly_cost numeric,
  contract_value numeric,
  data_visibility_level integer,
  max_suppliers integer,
  device_count integer,
  contact_email text,
  contact_phone text,
  responsible_name text,
  contract_notes text,
  customer_id uuid,
  category_id uuid,
  category_name text,
  category_icon text,
  category_color text,
  customer_full_name text,
  customer_company_name text,
  customer_email text,
  customer_phone text,
  customer_sector text,
  customer_province text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ml.id, ml.status, ml.credits_cost, ml.claimed_at, ml.created_at, ml.notes,
    c.id, c.name, c.supplier_name, c.description, c.start_date, c.end_date,
    c.monthly_cost, c.yearly_cost, c.contract_value, c.data_visibility_level,
    c.max_suppliers, c.device_count, c.contact_email, c.contact_phone,
    c.responsible_name, c.notes,
    c.user_id,
    cc.id, cc.name, cc.icon, cc.color,
    p.full_name, p.company_name, p.email, p.phone, p.sector, p.province
  FROM public.marketplace_leads ml
  JOIN public.contracts c ON c.id = ml.contract_id
  LEFT JOIN public.contract_categories cc ON cc.id = c.category_id
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE ml.supplier_id = auth.uid()
    AND ml.status IN ('claimed'::lead_status, 'in_progress'::lead_status, 'completed'::lead_status)
    AND public.is_supplier(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_my_claimed_leads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_claimed_leads() TO authenticated;
