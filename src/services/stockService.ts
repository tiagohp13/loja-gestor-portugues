import { v4 as uuidv4 } from 'uuid';
import { StockEntry, StockExit } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique stock entry number
export const generateStockEntryNumber = async (): Promise<string> => {
  try {
    // Try to get from Supabase function
    const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'entries' });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      return `ENT-${data}`;
    }
  } catch (error) {
    console.error('Error generating entry number from Supabase:', error);
  }
  
  // Fallback to local generation
  const prefix = 'ENT';
  const randomNumber = Math.floor(Math.random() * 100000);
  const entryNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return entryNumber;
};

// Generate a unique stock exit number
export const generateStockExitNumber = async (): Promise<string> => {
  try {
    // Try to get from Supabase function
    const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'exits' });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      return `SAI-${data}`;
    }
  } catch (error) {
    console.error('Error generating exit number from Supabase:', error);
  }
  
  // Fallback to local generation
  const prefix = 'SAI';
  const randomNumber = Math.floor(Math.random() * 100000);
  const exitNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return exitNumber;
};

// Load stock entries from localStorage or create an empty array
const loadStockEntries = (): StockEntry[] => {
  try {
    const entriesData = localStorage.getItem('stockEntries');
    return entriesData ? JSON.parse(entriesData) : [];
  } catch (error) {
    console.error('Error loading stock entries from localStorage:', error);
    return [];
  }
};

// Save stock entries to localStorage
const saveStockEntries = (entries: StockEntry[]): void => {
  try {
    localStorage.setItem('stockEntries', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving stock entries to localStorage:', error);
  }
};

// Load stock exits from localStorage or create an empty array
const loadStockExits = (): StockExit[] => {
  try {
    const exitsData = localStorage.getItem('stockExits');
    return exitsData ? JSON.parse(exitsData) : [];
  } catch (error) {
    console.error('Error loading stock exits from localStorage:', error);
    return [];
  }
};

// Save stock exits to localStorage
const saveStockExits = (exits: StockExit[]): void => {
  try {
    localStorage.setItem('stockExits', JSON.stringify(exits));
  } catch (error) {
    console.error('Error saving stock exits to localStorage:', error);
  }
};

// Get all stock entries
export const getStockEntries = async (): Promise<StockEntry[]> => {
  // First, try to get from localStorage
  const localEntries = loadStockEntries();
  
  try {
    // Try to fetch from Supabase
    const { data: entriesData, error: entriesError } = await supabase
      .from('StockEntries')
      .select('*')
      .order('createdat', { ascending: false });
    
    if (entriesError) {
      throw entriesError;
    }
    
    if (!entriesData) {
      return localEntries;
    }
    
    // Transform the returned data
    const entriesWithItems = await Promise.all(
      entriesData.map(async (entry) => {
        // Fetch items for each entry
        const { data: itemsData, error: itemsError } = await supabase
          .from('StockEntriesItems')
          .select('*')
          .eq('entryid', entry.id);
        
        if (itemsError) {
          console.error(`Error fetching items for entry ${entry.id}:`, itemsError);
          return {
            id: entry.id,
            supplierId: entry.supplierid,
            supplierName: entry.suppliername,
            entryNumber: entry.entrynumber,
            date: entry.date,
            invoiceNumber: entry.invoicenumber,
            notes: entry.notes,
            status: (entry.status as "pending" | "completed" | "cancelled"),
            discount: entry.discount || 0,
            createdAt: entry.createdat,
            updatedAt: entry.updatedat,
            items: []
          } as StockEntry;
        }
        
        // Map items to the expected format
        const mappedItems = (itemsData || []).map(item => ({
          productId: item.productid,
          productName: item.productname,
          quantity: item.quantity,
          purchasePrice: item.purchaseprice,
          discount: item.discount || 0
        }));
        
        // Return the entry with its mapped items
        return {
          id: entry.id,
          supplierId: entry.supplierid,
          supplierName: entry.suppliername,
          entryNumber: entry.entrynumber,
          date: entry.date,
          invoiceNumber: entry.invoicenumber,
          notes: entry.notes,
          status: (entry.status as "pending" | "completed" | "cancelled"),
          discount: entry.discount || 0,
          createdAt: entry.createdat,
          updatedAt: entry.updatedat,
          items: mappedItems
        } as StockEntry;
      })
    );
    
    // Save to localStorage for offline use
    saveStockEntries(entriesWithItems);
    
    return entriesWithItems;
  } catch (error) {
    console.error('Error fetching stock entries from Supabase:', error);
    // Return localStorage data as fallback
    return localEntries;
  }
};

// Get all stock exits
export const getStockExits = async (): Promise<StockExit[]> => {
  // First, try to get from localStorage
  const localExits = loadStockExits();
  
  try {
    // Try to fetch from Supabase
    const { data: exitsData, error: exitsError } = await supabase
      .from('StockExits')
      .select('*')
      .order('createdat', { ascending: false });
    
    if (exitsError) {
      throw exitsError;
    }
    
    if (!exitsData) {
      return localExits;
    }
    
    // Transform the returned data
    const exitsWithItems = await Promise.all(
      exitsData.map(async (exit) => {
        // Fetch items for each exit
        const { data: itemsData, error: itemsError } = await supabase
          .from('StockExitsItems')
          .select('*')
          .eq('exitid', exit.id);
        
        if (itemsError) {
          console.error(`Error fetching items for exit ${exit.id}:`, itemsError);
          return {
            id: exit.id,
            clientId: exit.clientid,
            clientName: exit.clientname,
            reason: exit.reason,
            exitNumber: exit.exitnumber,
            date: exit.date,
            invoiceNumber: exit.invoicenumber,
            notes: exit.notes,
            status: (exit.status as "pending" | "completed" | "cancelled"),
            discount: exit.discount || 0,
            fromOrderId: exit.fromorderid,
            createdAt: exit.createdat,
            updatedAt: exit.updatedat,
            items: []
          } as StockExit;
        }
        
        // Map items to the expected format
        const mappedItems = (itemsData || []).map(item => ({
          productId: item.productid,
          productName: item.productname,
          quantity: item.quantity,
          salePrice: item.saleprice,
          discount: item.discount || 0
        }));
        
        // Return the exit with its mapped items
        return {
          id: exit.id,
          clientId: exit.clientid,
          clientName: exit.clientname,
          reason: exit.reason,
          exitNumber: exit.exitnumber,
          date: exit.date,
          invoiceNumber: exit.invoicenumber,
          notes: exit.notes,
          status: (exit.status as "pending" | "completed" | "cancelled"),
          discount: exit.discount || 0,
          fromOrderId: exit.fromorderid,
          createdAt: exit.createdat,
          updatedAt: exit.updatedat,
          items: mappedItems
        } as StockExit;
      })
    );
    
    // Save to localStorage for offline use
    saveStockExits(exitsWithItems);
    
    return exitsWithItems;
  } catch (error) {
    console.error('Error fetching stock exits from Supabase:', error);
    // Return localStorage data as fallback
    return localExits;
  }
};

// Add a new stock entry
export const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber'>): Promise<StockEntry> => {
  const entryNumber = await generateStockEntryNumber();
  
  const newEntry: StockEntry = {
    id: uuidv4(),
    ...entry,
    entryNumber: entryNumber,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('StockEntries')
      .insert({
        id: newEntry.id,
        supplierid: newEntry.supplierId,
        suppliername: newEntry.supplierName,
        entrynumber: newEntry.entryNumber,
        date: newEntry.date,
        invoicenumber: newEntry.invoiceNumber,
        notes: newEntry.notes,
        status: newEntry.status,
        discount: newEntry.discount,
        createdat: newEntry.createdAt,
        updatedat: newEntry.updatedAt
      });
    
    if (error) {
      console.error('Error saving entry to Supabase:', error);
      throw error;
    }
    
    // Insert entry items
    if (newEntry.items && newEntry.items.length > 0) {
      const entryItems = newEntry.items.map(item => ({
        entryid: newEntry.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        purchaseprice: item.purchasePrice,
        discount: item.discount || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('StockEntriesItems')
        .insert(entryItems);
      
      if (itemsError) {
        console.error('Error saving entry items to Supabase:', itemsError);
        // Continue even with errors to save other items
      }
    }
  } catch (error) {
    console.error('Error adding stock entry:', error);
    // Continue with local save even if Supabase fails
  }
  
  // Update localStorage
  const entries = loadStockEntries();
  saveStockEntries([newEntry, ...entries]);
  
  return newEntry;
};

// Add a new stock exit
export const addStockExit = async (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>): Promise<StockExit> => {
  const exitNumber = await generateStockExitNumber();
  
  const newExit: StockExit = {
    id: uuidv4(),
    ...exit,
    exitNumber: exitNumber,
    status: 'completed',
    discount: exit.discount || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('StockExits')
      .insert({
        id: newExit.id,
        clientid: newExit.clientId,
        clientname: newExit.clientName,
        reason: newExit.reason,
        exitnumber: newExit.exitNumber,
        date: newExit.date,
        invoicenumber: newExit.invoiceNumber,
        notes: newExit.notes,
        status: newExit.status,
        discount: newExit.discount,
        fromorderid: newExit.fromOrderId,
        createdat: newExit.createdAt,
        updatedat: newExit.updatedAt
      });
    
    if (error) {
      console.error('Error saving exit to Supabase:', error);
      throw error;
    }
    
    // Insert exit items
    if (newExit.items && newExit.items.length > 0) {
      const exitItems = newExit.items.map(item => ({
        exitid: newExit.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        saleprice: item.salePrice,
        discount: item.discount || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('StockExitsItems')
        .insert(exitItems);
      
      if (itemsError) {
        console.error('Error saving exit items to Supabase:', itemsError);
        // Continue even with errors to save other items
      }
    }
  } catch (error) {
    console.error('Error adding stock exit:', error);
    // Continue with local save even if Supabase fails
  }
  
  // Update localStorage
  const exits = loadStockExits();
  saveStockExits([newExit, ...exits]);
  
  return newExit;
};

// Update a stock entry
export const updateStockEntry = async (id: string, updates: Partial<StockEntry>): Promise<StockEntry> => {
  const entries = loadStockEntries();
  const entryIndex = entries.findIndex(entry => entry.id === id);
  
  if (entryIndex === -1) {
    throw new Error(`Stock entry with id ${id} not found`);
  }
  
  const updatedEntry = {
    ...entries[entryIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  entries[entryIndex] = updatedEntry;
  
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('StockEntries')
      .update({
        supplierid: updatedEntry.supplierId,
        suppliername: updatedEntry.supplierName,
        date: updatedEntry.date,
        invoicenumber: updatedEntry.invoiceNumber,
        notes: updatedEntry.notes,
        status: updatedEntry.status,
        discount: updatedEntry.discount,
        updatedat: updatedEntry.updatedAt
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating entry in Supabase:', error);
      throw error;
    }
    
    // If items were updated, delete old items and insert new ones
    if (updates.items) {
      // First delete existing items
      const { error: deleteError } = await supabase
        .from('StockEntriesItems')
        .delete()
        .eq('entryid', id);
      
      if (deleteError) {
        console.error('Error deleting entry items from Supabase:', deleteError);
      }
      
      // Then insert new items
      const entryItems = updatedEntry.items.map(item => ({
        entryid: updatedEntry.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        purchaseprice: item.purchasePrice,
        discount: item.discount || 0
      }));
      
      const { error: insertError } = await supabase
        .from('StockEntriesItems')
        .insert(entryItems);
      
      if (insertError) {
        console.error('Error inserting updated entry items to Supabase:', insertError);
      }
    }
  } catch (error) {
    console.error('Error updating stock entry:', error);
    // Continue with local update even if Supabase fails
  }
  
  // Save to localStorage
  saveStockEntries(entries);
  
  return updatedEntry;
};

// Update a stock exit
export const updateStockExit = async (id: string, updates: Partial<StockExit>): Promise<StockExit> => {
  const exits = loadStockExits();
  const exitIndex = exits.findIndex(exit => exit.id === id);
  
  if (exitIndex === -1) {
    throw new Error(`Stock exit with id ${id} not found`);
  }
  
  const updatedExit = {
    ...exits[exitIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  exits[exitIndex] = updatedExit;
  
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('StockExits')
      .update({
        clientid: updatedExit.clientId,
        clientname: updatedExit.clientName,
        reason: updatedExit.reason,
        date: updatedExit.date,
        invoicenumber: updatedExit.invoiceNumber,
        notes: updatedExit.notes,
        status: updatedExit.status,
        discount: updatedExit.discount,
        updatedat: updatedExit.updatedAt
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating exit in Supabase:', error);
      throw error;
    }
    
    // If items were updated, delete old items and insert new ones
    if (updates.items) {
      // First delete existing items
      const { error: deleteError } = await supabase
        .from('StockExitsItems')
        .delete()
        .eq('exitid', id);
      
      if (deleteError) {
        console.error('Error deleting exit items from Supabase:', deleteError);
      }
      
      // Then insert new items
      const exitItems = updatedExit.items.map(item => ({
        exitid: updatedExit.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        saleprice: item.salePrice,
        discount: item.discount || 0
      }));
      
      const { error: insertError } = await supabase
        .from('StockExitsItems')
        .insert(exitItems);
      
      if (insertError) {
        console.error('Error inserting updated exit items to Supabase:', insertError);
      }
    }
  } catch (error) {
    console.error('Error updating stock exit:', error);
    // Continue with local update even if Supabase fails
  }
  
  // Save to localStorage
  saveStockExits(exits);
  
  return updatedExit;
};

// Delete a stock entry
export const deleteStockEntry = async (id: string): Promise<void> => {
  const entries = loadStockEntries();
  const filteredEntries = entries.filter(entry => entry.id !== id);
  
  try {
    // Delete items first
    const { error: itemsError } = await supabase
      .from('StockEntriesItems')
      .delete()
      .eq('entryid', id);
    
    if (itemsError) {
      console.error('Error deleting entry items from Supabase:', itemsError);
    }
    
    // Then delete entry
    const { error } = await supabase
      .from('StockEntries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting entry from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting stock entry:', error);
    // Continue with local delete even if Supabase fails
  }
  
  // Save to localStorage
  saveStockEntries(filteredEntries);
};

// Delete a stock exit
export const deleteStockExit = async (id: string): Promise<void> => {
  const exits = loadStockExits();
  const filteredExits = exits.filter(exit => exit.id !== id);
  
  try {
    // Delete items first
    const { error: itemsError } = await supabase
      .from('StockExitsItems')
      .delete()
      .eq('exitid', id);
    
    if (itemsError) {
      console.error('Error deleting exit items from Supabase:', itemsError);
    }
    
    // Then delete exit
    const { error } = await supabase
      .from('StockExits')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting exit from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting stock exit:', error);
    // Continue with local delete even if Supabase fails
  }
  
  // Save to localStorage
  saveStockExits(filteredExits);
};
