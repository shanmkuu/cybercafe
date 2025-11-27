-- FIX: Update sessions table foreign key constraint
-- The sessions table currently references the empty "users" table
-- It should reference "profiles" table instead (where actual user data lives)

-- Step 1: Drop the old foreign key constraint
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- Step 2: Add new foreign key constraint to profiles table
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Verify the constraint was created
-- SELECT constraint_name, table_name, column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name='sessions' AND column_name='user_id';
