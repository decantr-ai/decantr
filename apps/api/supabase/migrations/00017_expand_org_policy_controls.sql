ALTER TABLE organization_policies
  ADD COLUMN allow_member_submissions BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN require_private_content_approval BOOLEAN NOT NULL DEFAULT FALSE;
