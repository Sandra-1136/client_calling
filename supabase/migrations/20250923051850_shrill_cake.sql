/*
  # Create client_feedback table

  1. New Tables
    - `client_feedback`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, required, 1-5)
      - `feedback_text` (text, optional)
      - `feedback_date` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `client_feedback` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  feedback_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS client_feedback_client_id_idx ON client_feedback(client_id);
CREATE INDEX IF NOT EXISTS client_feedback_user_id_idx ON client_feedback(user_id);
CREATE INDEX IF NOT EXISTS client_feedback_rating_idx ON client_feedback(rating);

-- Enable RLS
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own client feedback"
  ON client_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client feedback"
  ON client_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client feedback"
  ON client_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client feedback"
  ON client_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);