
DROP POLICY IF EXISTS "Suppliers can view marketplace customer profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.is_supplier(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND is_supplier = true
  )
$$;

CREATE POLICY "Suppliers can view marketplace customer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_supplier(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.marketplace_leads ml
    WHERE ml.customer_id = profiles.user_id
  )
);
