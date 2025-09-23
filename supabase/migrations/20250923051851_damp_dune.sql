/*
  # Create client_notes table

  1. New Tables
    - `client_notes`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `user_id` (uuid, foreign key to auth.users)
      - `note_text` (text, required)
      - `is_urgent` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `client_notes` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  is_urgent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS client_notes_client_id_idx ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS client_notes_user_id_idx ON client_notes(user_id);
CREATE INDEX IF NOT EXISTS client_notes_urgent_idx ON client_notes(is_urgent);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own client notes"
  ON client_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client notes"
  ON client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client notes"
  ON client_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client notes"
  ON client_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);