
-- Auto-calculate contract status on insert/update
CREATE OR REPLACE FUNCTION public.set_contract_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('terminated','draft') THEN
    NEW.status := public.calculate_contract_status(NEW.end_date, COALESCE(NEW.termination_period_days, 30));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_contract_status ON public.contracts;
CREATE TRIGGER trg_set_contract_status
BEFORE INSERT OR UPDATE OF end_date, termination_period_days, status
ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.set_contract_status();

-- Recompute existing rows
UPDATE public.contracts
SET status = public.calculate_contract_status(end_date, COALESCE(termination_period_days, 30))
WHERE status NOT IN ('terminated','draft');
