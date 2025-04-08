
-- This file contains SQL to create all required tables for the CRM

-- Create Produtos table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Produtos" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  purchaseprice NUMERIC NOT NULL DEFAULT 0,
  saleprice NUMERIC NOT NULL DEFAULT 0,
  currentstock INTEGER NOT NULL DEFAULT 0,
  minstock INTEGER NOT NULL DEFAULT 0,
  supplierid UUID,
  suppliername TEXT,
  status TEXT DEFAULT 'active',
  createdat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add discount column to EncomendaItems if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'encomendasitems' AND column_name = 'discount'
  ) THEN
    ALTER TABLE "EncomendasItems" ADD COLUMN discount NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Add discount column to StockEntriesItems if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'stockentriesitems' AND column_name = 'discount'
  ) THEN
    ALTER TABLE "StockEntriesItems" ADD COLUMN discount NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Add discount column to StockExitsItems if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'stockexitsitems' AND column_name = 'discount'
  ) THEN
    ALTER TABLE "StockExitsItems" ADD COLUMN discount NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Create Categorias table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Categorias" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  createdat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Fornecedores table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Fornecedores" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  taxnumber TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  createdat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT now()
);
