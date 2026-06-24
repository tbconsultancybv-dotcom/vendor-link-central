GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_leads TO authenticated;
GRANT ALL ON public.marketplace_leads TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_appointments TO authenticated;
GRANT ALL ON public.supplier_appointments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_ratings TO authenticated;
GRANT ALL ON public.supplier_ratings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_suppliers TO authenticated;
GRANT ALL ON public.blocked_suppliers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_categories TO authenticated;
GRANT ALL ON public.contract_categories TO service_role;
GRANT SELECT ON public.contract_categories TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;