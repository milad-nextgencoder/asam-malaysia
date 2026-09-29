-- Seed migration: Legitimate Malaysian public universities for ASAM university directory
-- These are real, well-known Malaysian public universities.
-- Status: published (visible in public directory and member profile selector)

INSERT INTO public.universities (name, state, city, website, description, chapter_status, status)
VALUES
  ('University of Malaya', 'Kuala Lumpur', 'Kuala Lumpur', 'https://www.um.edu.my', 'Malaysia''s oldest and most prestigious public research university, located in Kuala Lumpur.', 'active', 'published'),
  ('Universiti Kebangsaan Malaysia', 'Selangor', 'Bangi', 'https://www.ukm.my', 'National University of Malaysia, a leading public research university in Bangi, Selangor.', 'active', 'published'),
  ('Universiti Putra Malaysia', 'Selangor', 'Serdang', 'https://www.upm.edu.my', 'UPM is a renowned public research university specializing in agriculture, forestry, and related fields.', 'active', 'published'),
  ('Universiti Sains Malaysia', 'Penang', 'Gelugor', 'https://www.usm.my', 'USM is a leading public research university in Penang, known for science and technology programs.', 'active', 'published'),
  ('Universiti Teknologi Malaysia', 'Johor', 'Skudai', 'https://www.utm.my', 'UTM is Malaysia''s premier public research university in engineering, science, and technology.', 'active', 'published'),
  ('Universiti Islam Antarabangsa Malaysia', 'Selangor', 'Gombak', 'https://www.iium.edu.py', 'IIUM is a public university in Gombak, Selangor, offering Islamic and modern academic programs.', 'coming_soon', 'published'),
  ('Universiti Utara Malaysia', 'Kedah', 'Sintok', 'https://www.uum.edu.my', 'UUM is a public university in Sintok, Kedah, specializing in management, accounting, and economics.', 'coming_soon', 'published'),
  ('Universiti Teknikal Malaysia Melaka', 'Melaka', 'Durian Tunggal', 'https://www.utem.edu.my', 'UTeM is a public technical university in Melaka, focusing on engineering and technology.', 'coming_soon', 'published'),
  ('Universiti Malaysia Pahang', 'Pahang', 'Gambang', 'https://www.ump.edu.my', 'UMP is a public university in Gambang, Pahang, specializing in engineering and technology.', 'coming_soon', 'published'),
  ('Universiti Malaysia Sabah', 'Sabah', 'Kota Kinabalu', 'https://www.ums.edu.my', 'UMS is a public university in Kota Kinabalu, Sabah, offering diverse academic programs.', 'coming_soon', 'published'),
  ('Universiti Malaysia Sarawak', 'Sarawak', 'Kota Samarahan', 'https://www.unimas.my', 'UNIMAS is a public university in Kota Samarahan, Sarawak, focusing on research and innovation.', 'coming_soon', 'published'),
  ('Universiti Pendidikan Sultan Idris', 'Perak', 'Tanjong Malim', 'https://www.upsi.edu.my', 'UPSI is a public university in Tanjong Malim, Perak, specializing in education and teacher training.', 'coming_soon', 'published'),
  ('Universiti Tun Hussein Onn Malaysia', 'Johor', 'Parit Raja', 'https://www.uthm.edu.my', 'UTHM is a public university in Parit Raja, Johor, specializing in engineering and technology.', 'coming_soon', 'published'),
  ('Universiti Malaysia Terengganu', 'Terengganu', 'Kuala Terengganu', 'https://www.umt.edu.my', 'UMT is a public university in Kuala Terengganu, focusing on marine science and fisheries.', 'coming_soon', 'published'),
  ('Universiti Malaysia Perlis', 'Perlis', 'Arau', 'https://www.unimap.edu.my', 'UniMAP is a public university in Arau, Perlis, specializing in engineering and technology.', 'coming_soon', 'published')
ON CONFLICT (name) DO NOTHING;
