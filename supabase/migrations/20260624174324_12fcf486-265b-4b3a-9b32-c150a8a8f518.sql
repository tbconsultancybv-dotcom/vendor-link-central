
DROP POLICY IF EXISTS "Suppliers can view marketplace contracts" ON public.contracts;
CREATE POLICY "Suppliers can view marketplace contracts"
ON public.contracts FOR SELECT TO authenticated
USING (is_on_marketplace = true AND public.is_supplier(auth.uid()));

DROP POLICY IF EXISTS "Suppliers can view available leads" ON public.marketplace_leads;
CREATE POLICY "Suppliers can view available leads"
ON public.marketplace_leads FOR SELECT TO authenticated
USING (
  (status = 'open'::lead_status AND public.is_supplier(auth.uid()))
  OR supplier_id = auth.uid()
);

DROP POLICY IF EXISTS "Suppliers can claim leads" ON public.marketplace_leads;
CREATE POLICY "Suppliers can claim leads"
ON public.marketplace_leads FOR UPDATE TO authenticated
USING (
  public.is_supplier(auth.uid())
  AND (status = 'open'::lead_status OR supplier_id = auth.uid())
);
