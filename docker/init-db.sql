-- =============================================================================
-- CampusOS — PostgreSQL Database Initialization
-- =============================================================================

-- Enable pgvector extension for AI/ML embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notify that initialization is complete
DO $$
BEGIN
  RAISE NOTICE 'CampusOS database initialized successfully';
  RAISE NOTICE 'Extensions: vector, uuid-ossp';
END $$;
