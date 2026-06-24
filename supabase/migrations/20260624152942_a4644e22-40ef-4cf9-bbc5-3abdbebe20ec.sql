DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.contract_categories;

CREATE POLICY "Authenticated users can view default and own categories"
ON public.contract_categories
FOR SELECT
TO authenticated
USING (created_by IS NULL OR created_by = auth.uid());