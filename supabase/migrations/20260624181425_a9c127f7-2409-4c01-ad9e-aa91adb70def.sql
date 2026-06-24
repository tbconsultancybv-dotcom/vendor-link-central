
CREATE POLICY "Customers can delete own open leads"
ON public.marketplace_leads
FOR DELETE
TO authenticated
USING (
  auth.uid() = customer_id
  AND status = 'open'::lead_status
);
