
-- This SQL function will be used to set local configuration settings
CREATE OR REPLACE FUNCTION public.set_local(setting text, value text)
RETURNS void AS $$
BEGIN
  EXECUTE format('SET LOCAL %I = %L', setting, value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
