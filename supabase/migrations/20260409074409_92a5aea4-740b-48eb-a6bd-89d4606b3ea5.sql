
-- Add Olas, PT Manasseh, Jonathan Daniels, Kyuni to clinic staff as lab technicians
INSERT INTO public.staff (full_name, email, role, status)
VALUES 
  ('Olas', 'ifeomanwachukwu70@gmail.com', 'lab_technician', 'active'),
  ('PT Manasseh', 'ptmanasseh@gmail.com', 'lab_technician', 'active'),
  ('Jonathan Daniels', 'jonathan.vista@gmail.com', 'lab_technician', 'active'),
  ('Kyuni', 'kyuni.vista@gmail.com', 'lab_technician', 'active');

-- Add PT Manasseh to ld_staff
INSERT INTO public.ld_staff (full_name, email, role, status)
VALUES ('PT Manasseh', 'ptmanasseh@gmail.com', 'technician', 'active');

-- Update ld_staff emails
UPDATE public.ld_staff SET email = 'ifeomanwachukwu70@gmail.com' WHERE id = 'bcf16506-9cd9-47b1-841c-c3ded3aa1412';
UPDATE public.ld_staff SET email = 'jonathan.vista@gmail.com' WHERE id = '51764b77-dec9-4fbd-8bb4-0a59bcba9438';
UPDATE public.ld_staff SET email = 'kyuni.vista@gmail.com' WHERE id = 'ee64638f-dfed-4155-b590-cc782ddbad07';
