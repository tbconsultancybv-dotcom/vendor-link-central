-- Allow authenticated users to update and delete contract categories they created
CREATE POLICY "Categories can be updated by creator"
ON public.contract_categories
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Categories can be deleted by creator"
ON public.contract_categories
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);