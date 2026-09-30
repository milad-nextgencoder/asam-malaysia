-- Seed migration: expansion of the ASAM university directory.
--
-- Scope: Malaysian public universities, private universities and university
-- colleges. Foreign branch campuses are deliberately excluded for now, as are
-- institutions that could not be independently verified (Asiae, Cyberjaya
-- University of Malaysia, Universiti Malaysia Online).
--
-- Every row is status = 'published' so it appears in the public directory and
-- the member profile university selector.
--
-- chapter_status is 'coming_soon' for all new rows. This asserts the existence
-- of a planned chapter only; it does not claim a chapter, a representative or
-- any Afghan enrolment at these institutions. Those remain unset and are to be
-- filled in by the team.
--
-- logo_url and representative are intentionally left NULL rather than guessed.
--
-- Idempotent: ON CONFLICT (lower(btrim(name))) now resolves against the
-- universities_name_unique constraint added in the previous migration.

INSERT INTO public.universities
  (name, state, city, website, description, chapter_status, status)
VALUES
  -- Public universities
  ('Universiti Teknologi MARA', 'Selangor', 'Shah Alam', 'https://www.uitm.edu.my',
   'A large public university headquartered in Shah Alam, Selangor, with an extensive network of state and branch campuses nationwide.', 'coming_soon', 'published'),
  ('Universiti Malaysia Kelantan', 'Kelantan', 'Bachok', 'https://www.umk.edu.my',
   'A public university in Kelantan with main and branch campuses in Bachok, Pengkalan Chepa and Jeli.', 'coming_soon', 'published'),
  ('Universiti Sultan Zainal Abidin', 'Terengganu', 'Kuala Terengganu', 'https://www.unisza.edu.my',
   'A public university in Terengganu with its main campus at Kampung Gong Badak, Kuala Terengganu.', 'coming_soon', 'published'),
  ('Universiti Pertahanan Nasional Malaysia', 'Kuala Lumpur', 'Sungai Besi', 'https://www.upnm.edu.my',
   'A public military university for the Malaysian Armed Forces, located at Sungai Besi Camp, Kuala Lumpur.', 'coming_soon', 'published'),

  -- Private universities
  ('Albukhary International University', 'Kedah', 'Alor Setar', 'https://aiu.edu.my',
   'A private university in Alor Setar, Kedah, Malaysia.', 'coming_soon', 'published'),
  ('UCSI University', 'Kuala Lumpur', 'Cheras', 'https://www.ucsiuniversity.edu.my',
   'A private university in Cheras, Kuala Lumpur, with additional campuses in Kuching and Bandar Springhill.', 'coming_soon', 'published'),
  ('Sunway University', 'Selangor', 'Bandar Sunway', 'https://sunwayuniversity.edu.my',
   'A private, not-for-profit university in Bandar Sunway, Petaling Jaya, Selangor.', 'coming_soon', 'published'),
  ('Taylor''s University', 'Selangor', 'Subang Jaya', 'https://university.taylors.edu.my',
   'A private university in Subang Jaya, Selangor, with full university status since 2010.', 'coming_soon', 'published'),
  ('SEGi University and Colleges', 'Selangor', 'Petaling Jaya', 'https://www.segi.edu.my',
   'A private university group headquartered in Kota Damansara, Petaling Jaya, with campuses in several states.', 'coming_soon', 'published'),
  ('HELP University', 'Selangor', 'Shah Alam', 'https://www.help.edu.my',
   'A private university in Shah Alam, Selangor, with full university status since 2011.', 'coming_soon', 'published'),
  ('Universiti Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', 'https://www.unikl.edu.my',
   'A multi-campus technical university wholly owned by Majlis Amanah Rakyat, with institutes across multiple Malaysian states.', 'coming_soon', 'published'),
  ('INTI International University', 'Selangor', 'Subang Jaya', 'https://newinti.edu.my',
   'A private university with its main campus in Subang Jaya, Selangor, and further campuses in Sarawak and Sabah.', 'coming_soon', 'published'),
  ('UNITAR International University', 'Selangor', 'Kelana Jaya', 'https://www.unitar.my',
   'A private university based in Kelana Jaya, Selangor.', 'coming_soon', 'published'),
  ('Universiti Tunku Abdul Rahman', 'Perak', 'Kampar', 'https://www.utar.edu.my',
   'A non-profit private research university with its main campus in Kampar, Perak, and a second campus in Selangor.', 'coming_soon', 'published'),
  ('Universiti Tenaga Nasional', 'Putrajaya', 'Putrajaya', 'https://www.uniten.edu.my',
   'A private university whose main campus is in Putrajaya, administered from Kajang, Selangor, with a branch campus in Terengganu.', 'coming_soon', 'published'),
  ('Management & Science University', 'Selangor', 'Shah Alam', 'https://www.msu.edu.my',
   'A private university in Shah Alam, Selangor, established as a university college in 2001.', 'coming_soon', 'published'),
  ('Universiti Teknologi PETRONAS', 'Perak', 'Seri Iskandar', 'https://www.utp.edu.my',
   'A private research university in Seri Iskandar, Perak, focused on engineering, technology and applied sciences.', 'coming_soon', 'published'),

  -- University college
  ('Lincoln University College', 'Selangor', 'Petaling Jaya', 'https://www.lincoln.edu.my',
   'A private university college in Petaling Jaya, Selangor, offering programmes across health sciences, business, engineering and education.', 'coming_soon', 'published')
ON CONFLICT (lower(btrim(name))) DO NOTHING;
