-- ====================================================================
-- NAMMA ADA: SEED 36 INDIAN STATES & UNION TERRITORIES AS UNCONFIGURED
-- Description:
-- Idempotently inserts all 28 States and 8 Union Territories into
-- public.shipping_rules with is_active = false and charge_paise = 0.
-- Administrators can then set actual shipping charges via the Admin Portal.
-- ====================================================================

insert into public.shipping_rules (state_code, state_name, charge_paise, is_active)
values
  -- 28 States
  ('AP', 'Andhra Pradesh', 0, false),
  ('AR', 'Arunachal Pradesh', 0, false),
  ('AS', 'Assam', 0, false),
  ('BR', 'Bihar', 0, false),
  ('CG', 'Chhattisgarh', 0, false),
  ('GA', 'Goa', 0, false),
  ('GJ', 'Gujarat', 0, false),
  ('HR', 'Haryana', 0, false),
  ('HP', 'Himachal Pradesh', 0, false),
  ('JH', 'Jharkhand', 0, false),
  ('KA', 'Karnataka', 0, false),
  ('KL', 'Kerala', 0, false),
  ('MP', 'Madhya Pradesh', 0, false),
  ('MH', 'Maharashtra', 0, false),
  ('MN', 'Manipur', 0, false),
  ('ML', 'Meghalaya', 0, false),
  ('MZ', 'Mizoram', 0, false),
  ('NL', 'Nagaland', 0, false),
  ('OD', 'Odisha', 0, false),
  ('PB', 'Punjab', 0, false),
  ('RJ', 'Rajasthan', 0, false),
  ('SK', 'Sikkim', 0, false),
  ('TN', 'Tamil Nadu', 0, false),
  ('TS', 'Telangana', 0, false),
  ('TR', 'Tripura', 0, false),
  ('UP', 'Uttar Pradesh', 0, false),
  ('UK', 'Uttarakhand', 0, false),
  ('WB', 'West Bengal', 0, false),

  -- 8 Union Territories
  ('AN', 'Andaman and Nicobar Islands', 0, false),
  ('CH', 'Chandigarh', 0, false),
  ('DN', 'Dadra and Nagar Haveli and Daman and Diu', 0, false),
  ('DL', 'Delhi', 0, false),
  ('JK', 'Jammu and Kashmir', 0, false),
  ('LA', 'Ladakh', 0, false),
  ('LD', 'Lakshadweep', 0, false),
  ('PY', 'Puducherry', 0, false)
on conflict (state_code) do update
set state_name = excluded.state_name;

