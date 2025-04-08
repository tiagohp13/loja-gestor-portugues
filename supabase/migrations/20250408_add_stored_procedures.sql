
-- Função para salvar uma encomenda
CREATE OR REPLACE FUNCTION public.save_order(
  order_id UUID,
  client_id UUID,
  client_name TEXT,
  order_number TEXT,
  order_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  converted_exit_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Inserir ou atualizar na tabela Encomendas
  INSERT INTO public."Encomendas" (
    id, clientid, clientname, ordernumber, date, notes, status, discount, 
    createdat, updatedat, convertedtostockexitid
  ) VALUES (
    order_id, client_id, client_name, order_number, order_date, notes, status,
    discount, created_at, updated_at, converted_exit_id
  )
  ON CONFLICT (id) DO UPDATE SET
    clientid = EXCLUDED.clientid,
    clientname = EXCLUDED.clientname,
    ordernumber = EXCLUDED.ordernumber,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status,
    discount = EXCLUDED.discount,
    updatedat = EXCLUDED.updatedat,
    convertedtostockexitid = EXCLUDED.convertedtostockexitid;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar um item de encomenda
CREATE OR REPLACE FUNCTION public.save_order_item(
  order_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  sale_price NUMERIC
) RETURNS VOID AS $$
BEGIN
  -- Inserir item na tabela EncomendasItems
  INSERT INTO public."EncomendasItems" (
    encomendaid, productid, productname, quantity, saleprice
  ) VALUES (
    order_id, product_id, product_name, quantity, sale_price
  );
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o status de uma encomenda
CREATE OR REPLACE FUNCTION public.update_order_status(
  order_id UUID,
  new_status TEXT,
  converted_exit_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Atualizar status e ID da saída convertida
  UPDATE public."Encomendas"
  SET 
    status = new_status,
    convertedtostockexitid = converted_exit_id,
    updatedat = NOW()
  WHERE id = order_id;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar uma entrada de stock
CREATE OR REPLACE FUNCTION public.save_stock_entry(
  entry_id UUID,
  supplier_id UUID,
  supplier_name TEXT,
  entry_number TEXT,
  entry_date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
  -- Inserir ou atualizar na tabela StockEntries
  INSERT INTO public."StockEntries" (
    id, supplierid, suppliername, entrynumber, date, invoicenumber, notes, 
    status, discount, createdat, updatedat
  ) VALUES (
    entry_id, supplier_id, supplier_name, entry_number, entry_date, invoice_number,
    notes, status, discount, created_at, updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    supplierid = EXCLUDED.supplierid,
    suppliername = EXCLUDED.suppliername,
    entrynumber = EXCLUDED.entrynumber,
    date = EXCLUDED.date,
    invoicenumber = EXCLUDED.invoicenumber,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status,
    discount = EXCLUDED.discount,
    updatedat = EXCLUDED.updatedat;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar um item de entrada de stock
CREATE OR REPLACE FUNCTION public.save_stock_entry_item(
  entry_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  purchase_price NUMERIC
) RETURNS VOID AS $$
BEGIN
  -- Inserir item na tabela StockEntriesItems
  INSERT INTO public."StockEntriesItems" (
    entryid, productid, productname, quantity, purchaseprice
  ) VALUES (
    entry_id, product_id, product_name, quantity, purchase_price
  );
END;
$$ LANGUAGE plpgsql;

-- Função para salvar uma saída de stock
CREATE OR REPLACE FUNCTION public.save_stock_exit(
  exit_id UUID,
  client_id UUID,
  client_name TEXT,
  reason TEXT,
  exit_number TEXT,
  exit_date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  from_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
  -- Inserir ou atualizar na tabela StockExits
  INSERT INTO public."StockExits" (
    id, clientid, clientname, reason, exitnumber, date, invoicenumber, notes,
    status, discount, fromorderid, createdat, updatedat
  ) VALUES (
    exit_id, client_id, client_name, reason, exit_number, exit_date, invoice_number,
    notes, status, discount, from_order_id, created_at, updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    clientid = EXCLUDED.clientid,
    clientname = EXCLUDED.clientname,
    reason = EXCLUDED.reason,
    exitnumber = EXCLUDED.exitnumber,
    date = EXCLUDED.date,
    invoicenumber = EXCLUDED.invoicenumber,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status,
    discount = EXCLUDED.discount,
    fromorderid = EXCLUDED.fromorderid,
    updatedat = EXCLUDED.updatedat;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar um item de saída de stock
CREATE OR REPLACE FUNCTION public.save_stock_exit_item(
  exit_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  sale_price NUMERIC
) RETURNS VOID AS $$
BEGIN
  -- Inserir item na tabela StockExitsItems
  INSERT INTO public."StockExitsItems" (
    exitid, productid, productname, quantity, saleprice
  ) VALUES (
    exit_id, product_id, product_name, quantity, sale_price
  );
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar os dados da encomenda
CREATE OR REPLACE FUNCTION public.get_orders() 
RETURNS TABLE (
  id UUID,
  client_id UUID,
  client_name TEXT,
  order_number TEXT,
  date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  converted_to_exit_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.ordernumber, 
    e.date, 
    e.notes, 
    e.status, 
    e.discount, 
    e.createdat, 
    e.updatedat, 
    e.convertedtostockexitid
  FROM 
    public."Encomendas" e
  ORDER BY 
    e.createdat DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar itens de uma encomenda
CREATE OR REPLACE FUNCTION public.get_order_items(p_order_id UUID) 
RETURNS TABLE (
  id UUID,
  order_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  sale_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.encomendaid,
    i.productid,
    i.productname,
    i.quantity,
    i.saleprice
  FROM 
    public."EncomendasItems" i
  WHERE 
    i.encomendaid = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar os dados de entradas de stock
CREATE OR REPLACE FUNCTION public.get_stock_entries() 
RETURNS TABLE (
  id UUID,
  supplier_id UUID,
  supplier_name TEXT,
  entry_number TEXT,
  date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.supplierid, 
    e.suppliername, 
    e.entrynumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount, 
    e.createdat, 
    e.updatedat
  FROM 
    public."StockEntries" e
  ORDER BY 
    e.createdat DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar itens de uma entrada
CREATE OR REPLACE FUNCTION public.get_stock_entry_items(p_entry_id UUID) 
RETURNS TABLE (
  id UUID,
  entry_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  purchase_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.entryid,
    i.productid,
    i.productname,
    i.quantity,
    i.purchaseprice
  FROM 
    public."StockEntriesItems" i
  WHERE 
    i.entryid = p_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar os dados de saídas de stock
CREATE OR REPLACE FUNCTION public.get_stock_exits() 
RETURNS TABLE (
  id UUID,
  client_id UUID,
  client_name TEXT,
  reason TEXT,
  exit_number TEXT,
  date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  from_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.reason,
    e.exitnumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount,
    e.fromorderid,
    e.createdat, 
    e.updatedat
  FROM 
    public."StockExits" e
  ORDER BY 
    e.createdat DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar uma saída específica
CREATE OR REPLACE FUNCTION public.get_stock_exit(p_exit_id UUID) 
RETURNS TABLE (
  id UUID,
  client_id UUID,
  client_name TEXT,
  reason TEXT,
  exit_number TEXT,
  date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  notes TEXT,
  status TEXT,
  discount NUMERIC,
  from_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.reason,
    e.exitnumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount,
    e.fromorderid,
    e.createdat, 
    e.updatedat
  FROM 
    public."StockExits" e
  WHERE
    e.id = p_exit_id;
END;
$$ LANGUAGE plpgsql;

-- Função para recuperar itens de uma saída
CREATE OR REPLACE FUNCTION public.get_stock_exit_items(p_exit_id UUID) 
RETURNS TABLE (
  id UUID,
  exit_id UUID,
  product_id UUID,
  product_name TEXT,
  quantity INTEGER,
  sale_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.exitid,
    i.productid,
    i.productname,
    i.quantity,
    i.saleprice
  FROM 
    public."StockExitsItems" i
  WHERE 
    i.exitid = p_exit_id;
END;
$$ LANGUAGE plpgsql;
