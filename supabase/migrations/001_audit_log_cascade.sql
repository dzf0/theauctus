-- Fix: audit_log FK blocks user deletion
-- Change ON DELETE NO ACTION → ON DELETE CASCADE
-- so deleting a user from auth.users automatically cleans up their audit rows

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
