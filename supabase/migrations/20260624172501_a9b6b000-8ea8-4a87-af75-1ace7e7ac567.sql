CREATE POLICY "Suppliers can view marketplace customer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.is_supplier = true
  )
  AND EXISTS (
    SELECT 1 FROM public.marketplace_leads ml
    WHERE ml.customer_id = profiles.user_id
  )
);