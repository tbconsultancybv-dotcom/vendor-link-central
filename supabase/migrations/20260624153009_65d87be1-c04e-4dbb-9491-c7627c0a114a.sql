GRANT SELECT ON public.contract_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_categories TO authenticated;
GRANT ALL ON public.contract_categories TO service_role;

DROP POLICY IF EXISTS "Anon can view default categories" ON public.contract_categories;

CREATE POLICY "Anon can view default categories"
ON public.contract_categories
FOR SELECT
TO anon
USING (created_by IS NULL);