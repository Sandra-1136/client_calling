/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone_number` (text, required, unique per user)
      - `whatsapp_number` (text, optional)
      - `email` (text, required)
      - `position` (text, required)
      - `department` (text, required)
      - `status` (enum: pending, calling, answered, missed)
      - `call_attempts` (integer, default 0)
      - `last_call_time` (timestamptz, optional)
      - `priority` (enum: high, follow-up, not-interested, optional)
      - `work_status` (enum: new, in_progress, completed, repeat_client)
      - `is_urgent` (boolean, default false)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `clients` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  email text NOT NULL DEFAULT 'Not provided',
  position text NOT NULL DEFAULT 'Not specified',
  department text NOT NULL DEFAULT 'Not specified',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'answered', 'missed')),
  call_attempts integer NOT NULL DEFAULT 0,
  last_call_time timestamptz,
  priority text CHECK (priority IN ('high', 'follow-up', 'not-interested')),
  work_status text NOT NULL DEFAULT 'new' CHECK (work_status IN ('new', 'in_progress', 'completed', 'repeat_client')),
  is_urgent boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint on phone_number per user
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_phone_unique 
ON clients(user_id, phone_number);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_status_idx ON clients(status);
CREATE INDEX IF NOT EXISTS clients_priority_idx ON clients(priority);
CREATE INDEX IF NOT EXISTS clients_work_status_idx ON clients(work_status);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();