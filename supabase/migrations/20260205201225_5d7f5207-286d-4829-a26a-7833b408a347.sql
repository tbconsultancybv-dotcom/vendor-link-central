-- =============================================
-- BIVARO COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'viewer', 'finance');
CREATE TYPE public.contract_status AS ENUM ('active', 'expiring', 'expired', 'terminated', 'draft');
CREATE TYPE public.lead_status AS ENUM ('open', 'claimed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('expiry_warning', 'action_required', 'lead_update', 'system', 'document_received');
CREATE TYPE public.notification_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_supplier BOOLEAN DEFAULT FALSE,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. USER ROLES TABLE
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 4. CONTRACT CATEGORIES TABLE
-- =============================================
CREATE TABLE public.contract_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#3B82F6',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contract_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by authenticated users" ON public.contract_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Categories can be created by authenticated users" ON public.contract_categories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Insert default categories
INSERT INTO public.contract_categories (name, description, icon, color) VALUES
  ('Telecom', 'Telefonie, internet en mobiele diensten', 'Phone', '#3B82F6'),
  ('Energie', 'Elektriciteit, gas en duurzame energie', 'Zap', '#22C55E'),
  ('IT Services', 'Software, hardware en IT ondersteuning', 'Monitor', '#8B5CF6'),
  ('Facilities', 'Kantoorinrichting en -onderhoud', 'Building2', '#F59E0B'),
  ('Printing', 'Printers, kopieerapparaten en supplies', 'Printer', '#EC4899'),
  ('Verzekeringen', 'Bedrijfs- en aansprakelijkheidsverzekeringen', 'Shield', '#06B6D4'),
  ('Leasing', 'Voertuigen en apparatuur leasing', 'Car', '#10B981'),
  ('Schoonmaak', 'Schoonmaakdiensten en hygiene', 'Sparkles', '#F97316');

-- 5. CONTRACTS TABLE
-- =============================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  category_id UUID REFERENCES public.contract_categories(id),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  termination_period_days INTEGER DEFAULT 30,
  silent_renewal BOOLEAN DEFAULT TRUE,
  renewal_period_months INTEGER DEFAULT 12,
  monthly_cost DECIMAL(12,2) DEFAULT 0,
  yearly_cost DECIMAL(12,2) DEFAULT 0,
  variable_costs TEXT,
  status contract_status DEFAULT 'active',
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  division TEXT,
  department TEXT,
  -- Marketplace fields
  is_on_marketplace BOOLEAN DEFAULT FALSE,
  marketplace_date TIMESTAMPTZ,
  max_suppliers INTEGER DEFAULT 3,
  data_visibility_level INTEGER DEFAULT 1, -- 1=basic, 2=medium, 3=full
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts" ON public.contracts
  FOR DELETE USING (auth.uid() = user_id);

-- Suppliers can view marketplace contracts
CREATE POLICY "Suppliers can view marketplace contracts" ON public.contracts
  FOR SELECT USING (
    is_on_marketplace = TRUE 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_supplier = TRUE)
  );

-- 6. DOCUMENTS TABLE
-- =============================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  source TEXT DEFAULT 'upload', -- 'upload', 'email', 'scan'
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_data JSONB,
  suggested_contract_id UUID REFERENCES public.contracts(id),
  is_linked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- 7. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_actioned BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. MARKETPLACE LEADS TABLE
-- =============================================
CREATE TABLE public.marketplace_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status lead_status DEFAULT 'open',
  credits_cost INTEGER NOT NULL DEFAULT 5,
  customer_credits_paid INTEGER DEFAULT 0,
  supplier_credits_paid INTEGER DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.marketplace_leads ENABLE ROW LEVEL SECURITY;

-- Customers can view leads for their contracts
CREATE POLICY "Customers can view own leads" ON public.marketplace_leads
  FOR SELECT USING (auth.uid() = customer_id);

-- Suppliers can view open leads and their claimed leads
CREATE POLICY "Suppliers can view available leads" ON public.marketplace_leads
  FOR SELECT USING (
    (status = 'open' AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_supplier = TRUE))
    OR supplier_id = auth.uid()
  );

-- Suppliers can claim leads
CREATE POLICY "Suppliers can claim leads" ON public.marketplace_leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_supplier = TRUE)
    AND (status = 'open' OR supplier_id = auth.uid())
  );

CREATE POLICY "System can insert leads" ON public.marketplace_leads
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 9. SUPPLIER APPOINTMENTS TABLE
-- =============================================
CREATE TABLE public.supplier_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.marketplace_leads(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  meeting_type TEXT DEFAULT 'video', -- 'video', 'physical', 'phone'
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.supplier_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON public.supplier_appointments
  FOR SELECT USING (auth.uid() = supplier_id OR auth.uid() = customer_id);

CREATE POLICY "Users can update own appointments" ON public.supplier_appointments
  FOR UPDATE USING (auth.uid() = supplier_id OR auth.uid() = customer_id);

CREATE POLICY "Suppliers can create appointments" ON public.supplier_appointments
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

-- 10. SUPPLIER RATINGS TABLE
-- =============================================
CREATE TABLE public.supplier_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.marketplace_leads(id) ON DELETE CASCADE,
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (lead_id, customer_id)
);

ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by authenticated users" ON public.supplier_ratings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers can insert ratings" ON public.supplier_ratings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 11. CREDIT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'lead_claim', 'lead_publish', 'refund', 'bonus'
  description TEXT,
  lead_id UUID REFERENCES public.marketplace_leads(id),
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. BLOCKED SUPPLIERS TABLE
-- =============================================
CREATE TABLE public.blocked_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (customer_id, supplier_id)
);

ALTER TABLE public.blocked_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocked suppliers" ON public.blocked_suppliers
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can block suppliers" ON public.blocked_suppliers
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can unblock suppliers" ON public.blocked_suppliers
  FOR DELETE USING (auth.uid() = customer_id);

-- 13. HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate contract status based on dates
CREATE OR REPLACE FUNCTION public.calculate_contract_status(
  p_end_date DATE,
  p_termination_period_days INTEGER
)
RETURNS contract_status AS $$
DECLARE
  days_until_expiry INTEGER;
  warning_threshold INTEGER;
BEGIN
  days_until_expiry := p_end_date - CURRENT_DATE;
  warning_threshold := GREATEST(p_termination_period_days, 90);
  
  IF days_until_expiry < 0 THEN
    RETURN 'expired'::contract_status;
  ELSIF days_until_expiry <= warning_threshold THEN
    RETURN 'expiring'::contract_status;
  ELSE
    RETURN 'active'::contract_status;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function to calculate lead credit cost
CREATE OR REPLACE FUNCTION public.calculate_lead_credits(
  p_max_suppliers INTEGER,
  p_data_visibility INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  base_cost INTEGER := 5;
  supplier_multiplier DECIMAL;
  visibility_multiplier DECIMAL;
BEGIN
  -- Fewer suppliers = higher cost per supplier
  IF p_max_suppliers = 1 THEN
    supplier_multiplier := 3.0;
  ELSIF p_max_suppliers = 2 THEN
    supplier_multiplier := 2.0;
  ELSIF p_max_suppliers <= 3 THEN
    supplier_multiplier := 1.5;
  ELSE
    supplier_multiplier := 1.0;
  END IF;
  
  -- More data visibility = higher cost
  visibility_multiplier := 1 + (p_data_visibility - 1) * 0.5;
  
  RETURN CEIL(base_cost * supplier_multiplier * visibility_multiplier);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Give new users a default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. STORAGE BUCKET FOR DOCUMENTS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );