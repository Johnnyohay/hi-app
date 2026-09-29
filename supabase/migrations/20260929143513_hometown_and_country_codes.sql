-- Splits location into "currently in" (the existing city/lat/lng) and
-- "originally from" (hometown), and stores a 2-letter country code
-- alongside each so the client can render a flag without a geocoding
-- round-trip on every render.

alter table public.profiles
  add column country_code text,
  add column hometown_city text not null default '',
  add column hometown_lat double precision,
  add column hometown_lng double precision,
  add column hometown_country_code text;
