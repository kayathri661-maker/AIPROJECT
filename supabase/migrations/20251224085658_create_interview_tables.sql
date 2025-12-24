/*
  # AI Interview Practice Bot Schema

  1. New Tables
    - `interviews`
      - `id` (uuid, primary key) - Unique identifier for each interview session
      - `role` (text) - Job role being interviewed for (e.g., "Software Engineer", "Product Manager")
      - `status` (text) - Current status: 'in_progress' or 'completed'
      - `score` (integer) - Final score out of 100
      - `feedback` (text) - Overall feedback from the AI
      - `created_at` (timestamptz) - When the interview was created
      - `completed_at` (timestamptz) - When the interview was completed

    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `interview_id` (uuid, foreign key) - References the interview session
      - `role` (text) - Message sender: 'ai' or 'user'
      - `content` (text) - The message content
      - `created_at` (timestamptz) - When the message was sent

  2. Security
    - Enable RLS on both tables
    - Add public access policies for demo purposes (no auth required)
*/

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  score integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_interview_id_idx ON messages(interview_id);
CREATE INDEX IF NOT EXISTS interviews_created_at_idx ON interviews(created_at DESC);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create interviews"
  ON interviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view interviews"
  ON interviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update interviews"
  ON interviews FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);