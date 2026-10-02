-- Initial batch of invite codes: six single-use codes for handing to
-- specific people one at a time, plus one multi-use code for sharing with a
-- small group at once. Create more later with a plain insert, e.g.:
--   insert into public.invite_codes (code, max_uses) values ('YOURCODE', 1);

insert into public.invite_codes (code, max_uses) values
  ('Y6BJ6VCR', 1),
  ('3KGUZML3', 1),
  ('ZTX9GTGY', 1),
  ('66PCXDMX', 1),
  ('QH23FYWZ', 1),
  ('QD9Y8GZ4', 1),
  ('PHF8CYMR', 5);
