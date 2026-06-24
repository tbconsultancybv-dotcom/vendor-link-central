-- Anonymized marketplace view for suppliers
CREATE OR REPLACE VIEW public.marketplace_listings
WITH (security_invoker = false) AS
SELECT
  ml.id              AS lead_id,
  ml.contract_id,
  ml.status,
  ml.credits_cost,
  ml.created_at,
  ml.claimed_at,
  ml.supplier_id,
  c.category_id,
  cc.name            AS category_name,
  cc.icon            AS category_icon,
  cc.color           AS category_color,
  c.end_date,
  c.device_count,
  c.data_visibility_level,
  p.sector,
  p.province
FROM public.marketplace_leads ml
JOIN public.contracts c
  ON c.id = ml.contract_id
 AND c.is_on_marketplace = true
LEFT JOIN public.contract_categories cc
  ON cc.id = c.category_id
LEFT JOIN public.profiles p
  ON p.user_id = c.user_id
WHERE
  (ml.status = 'open'::lead_status AND public.is_supplier(auth.uid()))
  OR ml.supplier_id = auth.uid();

REVOKE ALL ON public.marketplace_listings FROM PUBLIC, anon;
GRANT SELECT ON public.marketplace_listings TO authenticated;

-- Secure function: release real document links only when the lead is purchased by the requesting supplier
CREATE OR REPLACE FUNCTION public.get_lead_documents(_lead_id uuid)
RETURNS TABLE (
  id uuid,
  file_name text,
  file_path text,
  file_type text,
  file_size bigint,
  uploaded_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.id, d.file_name, d.file_path, d.file_type, d.file_size, d.created_at
  FROM public.documents d
  JOIN public.marketplace_leads ml ON ml.contract_id = d.contract_id
  WHERE ml.id = _lead_id
    AND ml.supplier_id = auth.uid()
    AND ml.status IN ('claimed'::lead_status, 'in_progress'::lead_status, 'completed'::lead_status)
    AND public.is_supplier(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_lead_documents(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_lead_documents(uuid) TO authenticated;