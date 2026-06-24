DROP VIEW IF EXISTS public.marketplace_listings;

CREATE OR REPLACE FUNCTION public.list_marketplace_listings()
RETURNS TABLE (
  lead_id uuid,
  contract_id uuid,
  status lead_status,
  credits_cost integer,
  created_at timestamptz,
  claimed_at timestamptz,
  supplier_id uuid,
  category_id uuid,
  category_name text,
  category_icon text,
  category_color text,
  end_date date,
  device_count integer,
  data_visibility_level integer,
  sector text,
  province text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ml.id, ml.contract_id, ml.status, ml.credits_cost, ml.created_at, ml.claimed_at, ml.supplier_id,
    c.category_id, cc.name, cc.icon, cc.color,
    c.end_date, c.device_count, c.data_visibility_level,
    p.sector, p.province
  FROM public.marketplace_leads ml
  JOIN public.contracts c
    ON c.id = ml.contract_id AND c.is_on_marketplace = true
  LEFT JOIN public.contract_categories cc ON cc.id = c.category_id
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE public.is_supplier(auth.uid())
    AND (ml.status = 'open'::lead_status OR ml.supplier_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.list_marketplace_listings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_marketplace_listings() TO authenticated;