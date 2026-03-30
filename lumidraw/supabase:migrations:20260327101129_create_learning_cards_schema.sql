/*
  # Create Learning Cards Schema for LumiDraw

  ## Overview
  This migration creates the database schema for storing generated learning cards
  in the LumiDraw application.

  ## New Tables
  
  ### `concepts`
  Stores the main concepts that users want to learn about
  - `id` (uuid, primary key) - Unique identifier for each concept
  - `name` (text) - The name of the concept (e.g., "Photosynthesis")
  - `created_at` (timestamptz) - When the concept was first generated
  
  ### `learning_cards`
  Stores the individual learning cards for each concept
  - `id` (uuid, primary key) - Unique identifier for each card
  - `concept_id` (uuid, foreign key) - References the parent concept
  - `sequence` (integer) - The order of this card in the learning sequence
  - `title` (text) - The title of this learning step
  - `description` (text) - Detailed explanation for this step
  - `image_url` (text) - URL to the generated image
  - `created_at` (timestamptz) - When the card was created

  ## Security
  - Enable RLS on both tables
  - Allow public read access for viewing cards
  - No write access needed from client (cards are generated via edge function)

  ## Notes
  1. Cards are generated server-side via edge function using AI
  2. Public read access allows anyone to view generated educational content
  3. Edge function uses service role key for writes
*/

CREATE TABLE IF NOT EXISTS concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_cards_concept_id ON learning_cards(concept_id);
CREATE INDEX IF NOT EXISTS idx_learning_cards_sequence ON learning_cards(concept_id, sequence);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view concepts"
  ON concepts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view learning cards"
  ON learning_cards FOR SELECT
  USING (true);
