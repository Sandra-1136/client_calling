/*
  # Add client feedback, appointments, and work history features

  1. New Tables
    - `client_feedback` - Store client feedback and ratings
    - `appointments` - Track client appointments and schedules
    - `work_history` - Track completed work for clients
    - `client_notes` - Additional notes and urgent flags

  2. Updates to existing tables
    - Add WhatsApp number and work status to clients table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add WhatsApp and work status to existing clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE clients ADD COLUMN whatsapp_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'work_status'
  ) THEN
    ALTER TABLE clients ADD COLUMN work_status text DEFAULT 'new' CHECK (work_status IN ('new', 'in_progress', 'completed', 'repeat_client'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'is_urgent'
  ) THEN
    ALTER TABLE clients ADD COLUMN is_urgent boolean DEFAULT false;
  END IF;
END $$;

-- Client Feedback Table
CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  feedback_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  appointment_type text DEFAULT 'consultation',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Work History Table
CREATE TABLE IF NOT EXISTS work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  work_type text NOT NULL,
  work_description text,
  start_date timestamptz,
  completion_date timestamptz,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'cancelled')),
  amount decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Client Notes Table
CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  is_urgent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Policies for client_feedback
CREATE POLICY "Users can view own client feedback"
  ON client_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client feedback"
  ON client_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client feedback"
  ON client_feedback FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client feedback"
  ON client_feedback FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for appointments
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for work_history
CREATE POLICY "Users can view own work history"
  ON work_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work history"
  ON work_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work history"
  ON work_history FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own work history"
  ON work_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for client_notes
CREATE POLICY "Users can view own client notes"
  ON client_notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client notes"
  ON client_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client notes"
  ON client_notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client notes"
  ON client_notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_feedback_client_id ON client_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_work_history_client_id ON work_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);