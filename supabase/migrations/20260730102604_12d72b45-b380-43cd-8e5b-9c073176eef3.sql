-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('user','lawyer','admin','police','judiciary');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_url text,
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE requested text;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.email,''),
          COALESCE(NEW.raw_user_meta_data->>'full_name',''),
          COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;

  requested := COALESCE(NEW.raw_user_meta_data->>'role','user');
  IF requested NOT IN ('user','lawyer','police','judiciary') THEN requested := 'user'; END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested::public.app_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LAWYER DIRECTORY ----------------------------------------------------
CREATE TABLE public.lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  image_url text,
  field text NOT NULL DEFAULT 'General Practice',
  firm text NOT NULL DEFAULT '',
  county text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  years_experience int NOT NULL DEFAULT 0,
  hourly_rate numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'UGX',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  languages text[] NOT NULL DEFAULT ARRAY['English'],
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lawyers TO authenticated;
GRANT SELECT ON public.lawyers TO anon;
GRANT ALL ON public.lawyers TO service_role;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyers_public_read" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "lawyers_admin_write" ON public.lawyers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
CREATE TRIGGER trg_lawyers_touch BEFORE UPDATE ON public.lawyers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CONTENT -------------------------------------------------------------
CREATE TABLE public.legal_advices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_advices TO authenticated;
GRANT SELECT ON public.legal_advices TO anon;
GRANT ALL ON public.legal_advices TO service_role;
ALTER TABLE public.legal_advices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advices_public_read" ON public.legal_advices FOR SELECT USING (true);
CREATE POLICY "advices_admin_write" ON public.legal_advices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'news',
  image_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT SELECT ON public.news_posts TO anon;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news_posts FOR SELECT USING (true);
CREATE POLICY "news_admin_write" ON public.news_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT SELECT ON public.quotes TO anon;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_public_read" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "quotes_admin_write" ON public.quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- POLICE --------------------------------------------------------------
CREATE TABLE public.police_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.police_stations TO authenticated;
GRANT SELECT ON public.police_stations TO anon;
GRANT ALL ON public.police_stations TO service_role;
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations_public_read" ON public.police_stations FOR SELECT USING (true);
CREATE POLICY "stations_write" ON public.police_stations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'police'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'police'));

CREATE TABLE public.wanted_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  suspect_of text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  station text NOT NULL DEFAULT '',
  reward numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'wanted',
  posted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wanted_persons TO authenticated;
GRANT SELECT ON public.wanted_persons TO anon;
GRANT ALL ON public.wanted_persons TO service_role;
ALTER TABLE public.wanted_persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wanted_public_read" ON public.wanted_persons FOR SELECT USING (true);
CREATE POLICY "wanted_write" ON public.wanted_persons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'police'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'police'));

-- JUDICIARY -----------------------------------------------------------
CREATE TABLE public.judgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  case_number text NOT NULL DEFAULT '',
  court text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  document_url text,
  image_url text,
  delivered_on date,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judgements TO authenticated;
GRANT SELECT ON public.judgements TO anon;
GRANT ALL ON public.judgements TO service_role;
ALTER TABLE public.judgements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judgements_public_read" ON public.judgements FOR SELECT USING (true);
CREATE POLICY "judgements_write" ON public.judgements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'judiciary'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'judiciary'));

-- CASES ---------------------------------------------------------------
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'normal',
  reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_read" ON public.cases FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR assignee_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cases_insert" ON public.cases FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "cases_update" ON public.cases FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR assignee_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR assignee_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cases_delete" ON public.cases FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cases_touch BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- APPOINTMENTS --------------------------------------------------------
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 30,
  mode text NOT NULL DEFAULT 'video',
  status text NOT NULL DEFAULT 'scheduled',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appt_read" ON public.appointments FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR lawyer_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appt_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "appt_update" ON public.appointments FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR lawyer_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (client_id = auth.uid() OR lawyer_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appt_delete" ON public.appointments FOR DELETE TO authenticated
  USING (client_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_appt_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MESSAGING -----------------------------------------------------------
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterpart_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, counterpart_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_read" ON public.conversations FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR counterpart_id = auth.uid());
CREATE POLICY "conv_insert" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR counterpart_id = auth.uid());
CREATE POLICY "conv_update" ON public.conversations FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR counterpart_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR counterpart_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id AND (c.client_id = _user_id OR c.counterpart_id = _user_id))
$$;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_read" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "msg_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "msg_update" ON public.messages FOR UPDATE TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()))
  WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- DOCUMENT VAULT ------------------------------------------------------
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  version int NOT NULL DEFAULT 1,
  encrypted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_own" ON public.documents FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- NOTIFICATIONS -------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'in_app',
  read boolean NOT NULL DEFAULT false,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- PAYMENTS ------------------------------------------------------------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mobile_money',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'UGX',
  status text NOT NULL DEFAULT 'pending',
  provider_reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_own" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pay_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pay_update" ON public.payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- COMPLAINTS ----------------------------------------------------------
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id uuid REFERENCES public.police_stations(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  incident_location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted',
  reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaint_read" ON public.complaints FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "complaint_insert" ON public.complaints FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "complaint_update" ON public.complaints FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_complaints_touch BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED ----------------------------------------------------------------
INSERT INTO public.lawyers (full_name,email,phone,field,firm,county,bio,years_experience,hourly_rate,rating,review_count,languages,verified,image_url) VALUES
('Grace Nakimuli','grace.nakimuli@legalfinder.ug','+256 772 118 240','Family Law','Nakimuli & Partners Advocates','Kampala','Family and matrimonial law specialist handling divorce, custody, succession and child maintenance with over a decade of courtroom experience.',12,180000,4.9,164,ARRAY['English','Luganda'],true,null),
('David Ochieng','david.ochieng@legalfinder.ug','+256 701 553 902','Criminal Defence','Ochieng Advocates','Kampala','Criminal defence advocate appearing before the High Court and Court of Appeal in serious crime, bail and appeal matters.',15,250000,4.8,231,ARRAY['English','Swahili','Luganda'],true,null),
('Aisha Namutebi','aisha.namutebi@legalfinder.ug','+256 758 400 117','Land & Property','Namutebi Legal Chambers','Wakiso','Land, conveyancing and property disputes: title verification, boundary conflicts, landlord and tenant matters.',9,150000,4.7,98,ARRAY['English','Luganda'],true,null),
('Peter Wanyama','peter.wanyama@legalfinder.ug','+256 772 990 411','Corporate & Commercial','Wanyama & Co. Advocates','Jinja','Company formation, commercial contracts, mergers, regulatory compliance and corporate governance advisory.',18,320000,4.9,142,ARRAY['English'],true,null),
('Sarah Achieng','sarah.achieng@legalfinder.ug','+256 703 221 885','Employment Law','Achieng Employment Law','Kampala','Employment and labour disputes, wrongful dismissal, workplace harassment claims and HR policy advisory.',7,140000,4.6,76,ARRAY['English','Swahili'],true,null),
('Joseph Mubiru','joseph.mubiru@legalfinder.ug','+256 782 664 019','Human Rights','Mubiru Human Rights Centre','Mbarara','Constitutional petitions, civil liberties, refugee protection and public interest litigation.',11,120000,4.8,119,ARRAY['English','Runyankole'],true,null),
('Miriam Atim','miriam.atim@legalfinder.ug','+256 774 331 508','Immigration','Atim Immigration Advocates','Gulu','Work permits, citizenship applications, visa appeals and cross-border residency matters.',6,130000,4.5,54,ARRAY['English','Acholi'],true,null),
('Emmanuel Kiprotich','emmanuel.kiprotich@legalfinder.ug','+256 709 887 233','Intellectual Property','Kiprotich IP Chambers','Kampala','Trademarks, copyright enforcement, patent filing and technology licensing for startups and creatives.',10,210000,4.7,88,ARRAY['English'],true,null),
('Rebecca Nabwire','rebecca.nabwire@legalfinder.ug','+256 776 442 190','Tax Law','Nabwire Tax Advisory','Kampala','Tax planning, URA disputes, customs appeals and compliance reviews for SMEs and corporates.',13,240000,4.8,101,ARRAY['English','Lusoga'],true,null),
('Samuel Okot','samuel.okot@legalfinder.ug','+256 771 205 663','Personal Injury','Okot & Associates','Lira','Road traffic accident claims, medical negligence and workplace injury compensation.',8,110000,4.4,63,ARRAY['English','Acholi'],true,null),
('Christine Auma','christine.auma@legalfinder.ug','+256 705 118 774','Environmental Law','Auma Green Law','Fort Portal','Environmental compliance, land conservation, mining and extractives regulation.',9,160000,4.6,47,ARRAY['English'],true,null),
('Ibrahim Ssekandi','ibrahim.ssekandi@legalfinder.ug','+256 778 660 314','Banking & Finance','Ssekandi Finance Legal','Kampala','Loan documentation, debt recovery, securities, insolvency and financial regulation.',14,280000,4.7,93,ARRAY['English','Luganda'],true,null);

INSERT INTO public.police_stations (name,district,address,phone,email,latitude,longitude) VALUES
('Central Police Station Kampala','Kampala','Parliament Avenue, Kampala','+256 414 250 613','cps.kampala@police.go.ug',0.3136,32.5811),
('Kira Division Police Station','Wakiso','Kira Town Council, Wakiso','+256 414 597 220','kira@police.go.ug',0.4009,32.6440),
('Jinja Road Police Station','Kampala','Jinja Road, Nakawa','+256 414 255 401','jinjaroad@police.go.ug',0.3226,32.6003),
('Gulu Central Police Station','Gulu','Coronation Road, Gulu','+256 471 432 118','gulu@police.go.ug',2.7746,32.2990),
('Mbarara Central Police Station','Mbarara','High Street, Mbarara','+256 485 420 337','mbarara@police.go.ug',-0.6072,30.6545),
('Jinja Central Police Station','Jinja','Main Street, Jinja','+256 434 121 445','jinja@police.go.ug',0.4244,33.2041);

INSERT INTO public.legal_advices (title,category,summary,content) VALUES
('What to do when you are arrested','Criminal','Know your constitutional rights during arrest and the first 48 hours in custody.','You have the right to be informed of the reason for your arrest in a language you understand. You have the right to remain silent and the right to a lawyer of your choice. Police must produce you before a court within 48 hours of arrest. Do not sign any statement you have not read or do not understand. Ask for the arresting officer''s name, number and station, and ask them to notify a relative. If you cannot afford a lawyer, request state brief representation at your first court appearance.'),
('Buying land safely: a step by step guide','Land & Property','Search the title, verify the seller and complete the transfer correctly.','Before paying any money, conduct an official search at the Ministry of Lands to confirm ownership, encumbrances and caveats. Visit the land physically with the seller and neighbours present. Confirm the seller''s identity documents match the title. Insist on a written sale agreement witnessed by an advocate. Pay through traceable channels only. After payment, lodge transfer forms, consent, valuation and stamp duty. Only treat the transaction as complete once a new title is issued in your name.'),
('Your rights at work','Employment','Contracts, notice periods, dismissal and how to challenge unfair treatment.','Every employee working more than one month is entitled to a written contract. Working hours should not exceed 48 hours a week without overtime. Notice periods depend on length of service, ranging from two weeks to three months. Dismissal must follow a fair process including a hearing. Unfair dismissal claims can be filed with a labour officer within three months. Keep copies of payslips, contracts and all written communication with your employer.'),
('Filing for divorce and child custody','Family','Grounds, process, maintenance and the best interests of the child.','A petition for divorce is filed in the Family Division of the High Court or a Chief Magistrate''s Court. Recognised grounds include adultery, cruelty and desertion. Custody decisions are always guided by the best interests of the child, considering age, stability and each parent''s capacity. Maintenance is calculated on the needs of the child and the means of the parent. Mediation is encouraged before contested hearings and can significantly reduce cost and delay.'),
('Starting a company: legal checklist','Corporate','Registration, licences, tax and compliance obligations for new businesses.','Reserve your company name with the Registration Services Bureau, then file the memorandum and articles of association. Obtain a certificate of incorporation, a Tax Identification Number and a trading licence from your local authority. Register for VAT if turnover exceeds the statutory threshold, and register employees for social security. Maintain a statutory register, hold annual general meetings and file annual returns to stay compliant.'),
('How to report and follow up a police case','Criminal','Making a statement, obtaining a reference number and tracking progress.','Report at the station nearest to where the incident occurred. Give a clear factual statement and read it before signing. Insist on a Statement Reference or Case Reference number and the name of the investigating officer. Keep a copy of any medical or police form issued. If the case stalls, escalate to the Officer in Charge of Criminal Investigations, then to the Regional Police Commander or the Professional Standards Unit.'),
('Understanding tenancy agreements','Land & Property','Deposits, rent increases, repairs and eviction procedure.','A tenancy agreement should state rent, payment date, deposit, duration, and who is responsible for repairs and utilities. A landlord cannot increase rent mid-term unless the agreement allows it. Eviction requires written notice and, where disputed, a court order. Self-help eviction such as locking out a tenant or removing a roof is unlawful. Always obtain receipts for rent and deposit payments.'),
('Consumer rights and defective goods','Consumer','Refunds, warranties and where to complain.','Goods sold must be of merchantable quality and fit for their described purpose. Keep the receipt, warranty card and packaging. Report defects promptly and in writing. If a trader refuses a remedy, complain to the Uganda National Bureau of Standards or the competition and consumer protection authority. Small claims procedures in Magistrates'' Courts handle low value disputes quickly and without an advocate.');

INSERT INTO public.news_posts (title,kind,body) VALUES
('Judiciary rolls out electronic case management nationwide','news','Filing, service and hearing notices for civil matters can now be handled electronically in all High Court circuits, reducing adjournments and physical file loss.'),
('New small claims threshold announced','news','The monetary limit for small claims procedure has been revised upward, allowing more low value disputes to be resolved without an advocate.'),
('Free legal aid week for vulnerable groups','news','A coalition of law firms and civil society organisations will offer free consultations on land, family and criminal matters at regional centres.'),
('Never share your one time password','tip','No bank, mobile money agent or police officer will ever ask for your OTP or PIN. Anyone who does is attempting fraud. Hang up and report the number.'),
('Verify land titles before paying a deposit','tip','Fraudulent titles are the single largest cause of land loss. An official search costs a fraction of a deposit and takes days, not months.'),
('Keep digital copies of key documents','tip','Store scanned copies of your national ID, title deeds, contracts and receipts in a secure vault. Lost originals are far easier to replace with a copy on hand.'),
('Be careful what you sign at a police station','tip','Read every statement before signing, and never sign a blank or incomplete page. You are entitled to a copy of anything you sign.'),
('Report cyber fraud within 24 hours','tip','Mobile money and bank reversals are far more likely to succeed when reported immediately. Save transaction IDs and screenshots.');

INSERT INTO public.quotes (content,author) VALUES
('Injustice anywhere is a threat to justice everywhere.','Martin Luther King Jr.'),
('The law is reason, free from passion.','Aristotle'),
('Justice delayed is justice denied.','William E. Gladstone'),
('Equal justice under law is not merely a caption on a courthouse; it is perhaps the most inspiring ideal of our society.','Lewis F. Powell Jr.'),
('Where law ends, tyranny begins.','William Pitt'),
('The good lawyer is not the man who has an eye to every side and angle of contingency, but who throws himself on your part so heartily that he can get you out of a scrape.','Ralph Waldo Emerson');

INSERT INTO public.wanted_persons (name,suspect_of,description,station,reward,status) VALUES
('Robert Mugisha','Aggravated robbery','Wanted in connection with a series of armed robberies on commercial premises. Considered dangerous; do not approach.','Central Police Station Kampala',5000000,'wanted'),
('Alex Ochola','Motor vehicle theft','Suspected of running a vehicle theft and re-registration syndicate operating across three districts.','Jinja Road Police Station',3000000,'wanted'),
('Nelson Barigye','Financial fraud','Suspected of defrauding depositors through a fictitious investment scheme.','Mbarara Central Police Station',4000000,'wanted'),
('Hassan Lubega','Assault causing grievous harm','Failed to appear before court after being granted bail in an assault matter.','Kira Division Police Station',1000000,'wanted');

INSERT INTO public.judgements (title,case_number,court,description,delivered_on) VALUES
('Nakato v. Ssemakula — Matrimonial property','HCT-00-FD-CS-0142-2024','High Court, Family Division','The court set out the principles for distributing matrimonial property where a non-monetary contribution is proved, holding that domestic contribution is a recognised and quantifiable contribution.','2024-11-18'),
('Uganda v. Okello — Bail pending appeal','CR-APP-0087-2024','Court of Appeal','Clarified the threshold for granting bail pending appeal, emphasising exceptional circumstances and the likelihood of success on appeal.','2024-09-04'),
('Kato v. Kampala Capital City Authority','HCT-00-CV-MA-0431-2023','High Court, Civil Division','Judicial review of a demolition notice issued without a hearing. The court quashed the notice for breach of natural justice.','2023-12-12'),
('Bwire v. Standard Freight Ltd — Wrongful dismissal','LDC-0059-2024','Industrial Court','Awarded compensation for dismissal effected without a disciplinary hearing, restating the mandatory procedural requirements before termination.','2024-06-27'),
('In re Estate of the late Y. Musoke','HCT-00-FD-AC-0210-2024','High Court, Family Division','Guidance on the distribution of an intestate estate and the duties of an administrator toward beneficiaries.','2024-08-15');