/*
  # Create work_history table

  1. New Tables
    - `work_history`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `user_id` (uuid, foreign key to auth.users)
      - `work_type` (text, required)
      - `work_description` (text, optional)
      - `start_date` (timestamptz, optional)
      - `completion_date` (timestamptz, optional)
      - `status` (enum: completed, in_progress, cancelled)
      - `amount` (numeric, optional)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `work_history` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_type text NOT NULL,
  work_description text,
  start_date timestamptz,
  completion_date timestamptz,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('completed', 'in_progress', 'cancelled')),
  amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS work_history_client_id_idx ON work_history(client_id);
CREATE INDEX IF NOT EXISTS work_history_user_id_idx ON work_history(user_id);
CREATE INDEX IF NOT EXISTS work_history_status_idx ON work_history(status);

-- Enable RLS
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own work history"
  ON work_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work history"
  ON work_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work history"
  ON work_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work history"
  ON work_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);