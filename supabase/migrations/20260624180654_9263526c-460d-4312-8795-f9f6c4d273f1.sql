
-- Helper: bepaalt of de huidige gebruiker als leverancier een document mag inzien
CREATE OR REPLACE FUNCTION public.can_supplier_access_document(_object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.documents d
    JOIN public.marketplace_leads ml ON ml.contract_id = d.contract_id
    WHERE d.file_path = _object_name
      AND ml.supplier_id = auth.uid()
      AND ml.status IN ('claimed'::lead_status, 'in_progress'::lead_status, 'completed'::lead_status)
      AND public.is_supplier(auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.can_supplier_access_document(text) FROM public;
GRANT EXECUTE ON FUNCTION public.can_supplier_access_document(text) TO authenticated;

-- Bestaande policies vervangen door strakkere varianten (alleen authenticated)
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can read purchased lead documents" ON storage.objects;

-- Eigenaar mag eigen bestanden lezen
CREATE POLICY "Owners can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eigenaar mag uploaden in eigen map
CREATE POLICY "Owners can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eigenaar mag bijwerken (bv. metadata) binnen eigen map
CREATE POLICY "Owners can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eigenaar mag eigen bestanden verwijderen
CREATE POLICY "Owners can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Leveranciers mogen alléén lezen wanneer ze de bijbehorende lead hebben gekocht
CREATE POLICY "Suppliers can read purchased lead documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.can_supplier_access_document(name)
);
