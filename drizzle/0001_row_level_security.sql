-- Row-level security, per §M2.
--
-- The rule the whole directory rests on: the public can read a published
-- organization and nothing else. Members write their own organization.
-- Admins write everything. A donor's ledger is theirs alone — no admin
-- SELECT policy exists on `gifts`, `giving_list_items`, `favorites` or
-- `donor_profiles`, deliberately, because nobody running this site has any
-- business reading what a person gave or what they earn.
--
-- Apply after 0000. Written for Supabase, where `auth.uid()` is the
-- authenticated user and the service-role key bypasses RLS entirely.

-- Full-text and trigram search used by the org listing pages.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE INDEX IF NOT EXISTS organizations_name_trgm_idx
  ON organizations USING gin (legal_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS organizations_dba_trgm_idx
  ON organizations USING gin (dba gin_trgm_ops);

-- "Near me" sorting.
CREATE INDEX IF NOT EXISTS organizations_geo_idx
  ON organizations USING gist (ll_to_earth(lat, lng))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Helper: does the current user belong to this organization?
CREATE OR REPLACE FUNCTION is_org_member(target_org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = target_org
      AND org_members.user_id = auth.uid()
  );
$$;

/* ------------------------------------------------------------ public read */

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_public_read ON organizations
  FOR SELECT USING (is_published = true);

CREATE POLICY organizations_member_write ON organizations
  FOR UPDATE USING (is_org_member(id) OR is_admin())
  WITH CHECK (is_org_member(id) OR is_admin());

CREATE POLICY organizations_admin_insert ON organizations
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY organizations_admin_delete ON organizations
  FOR DELETE USING (is_admin());

-- The child tables all follow the same shape: readable when the parent
-- organization is published, writable by its members.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments', 'campaigns', 'payment_methods', 'endorsements']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format($f$
      CREATE POLICY %1$s_public_read ON %1$I
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM organizations o
                  WHERE o.id = %1$I.org_id AND o.is_published = true)
        )
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY %1$s_member_write ON %1$I
        FOR ALL USING (is_org_member(%1$I.org_id) OR is_admin())
        WITH CHECK (is_org_member(%1$I.org_id) OR is_admin())
    $f$, t);
  END LOOP;
END $$;

-- Categories are reference data.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
CREATE POLICY categories_admin_write ON categories FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE organization_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_categories_public_read ON organization_categories
  FOR SELECT USING (true);
CREATE POLICY org_categories_member_write ON organization_categories
  FOR ALL USING (is_org_member(org_id) OR is_admin())
  WITH CHECK (is_org_member(org_id) OR is_admin());

/* --------------------------------------------------------- donor-private */

ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY donor_profiles_own ON donor_profiles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY gifts_own ON gifts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE giving_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY giving_list_own ON giving_list_items
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_own ON favorites
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

/* -------------------------------------------------------------- workflow */

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_read ON org_members
  FOR SELECT USING (user_id = auth.uid() OR is_org_member(org_id) OR is_admin());
CREATE POLICY org_members_admin_write ON org_members
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- A claim request is visible to the person who made it and to admins. It is
-- never readable by the organization being claimed — that would let an
-- incumbent see a rival claim before it is verified.
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY claim_requests_own ON claim_requests
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY claim_requests_insert ON claim_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY claim_requests_admin_write ON claim_requests
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Anyone may file a removal request or an abuse report, including someone who
-- is not signed in. Only admins may read them.
ALTER TABLE removal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY removal_requests_insert ON removal_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY removal_requests_admin_read ON removal_requests
  FOR SELECT USING (is_admin());
CREATE POLICY removal_requests_admin_write ON removal_requests
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY abuse_reports_insert ON abuse_reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY abuse_reports_admin_read ON abuse_reports
  FOR SELECT USING (is_admin());
CREATE POLICY abuse_reports_admin_write ON abuse_reports
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_admin_read ON audit_log FOR SELECT USING (is_admin());
-- Writes to the audit log come from the service role only, which bypasses RLS.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own ON users FOR SELECT USING (id = auth.uid() OR is_admin());
