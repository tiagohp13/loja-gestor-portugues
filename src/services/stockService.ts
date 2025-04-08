
import { v4 as uuidv4 } from 'uuid';
import { StockEntry, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique stock entry number
export async function generateStockEntryNumber(): Promise<string> {
  const prefix = 'ENT';
  const randomNumber = Math.floor(Math.random() * 100000);
  const entryNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return entryNumber;
}

// Generate a unique stock exit number
export async function generateStockExitNumber(): Promise<string> {
  const prefix = 'SAI';
  const randomNumber = Math.floor(Math.random() * 100000);
  const exitNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return exitNumber;
}

// Fetch all stock entries
export async function fetchStockEntries(): Promise<StockEntry[]> {
  try {
    const { data: entriesData, error: entriesError } = await supabase
      .from('StockEntries')
      .select('*')
      .order('createdat', { ascending: false });

    if (entriesError) {
      throw entriesError;
    }

    if (!entriesData) {
      throw new Error("No stock entries found");
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
            discount: 0, // Setting fixed discount to 0
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
          discount: item.discount || 0 // Add fallback to 0 if discount is missing
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
          status: entry.status as "pending" | "completed" | "cancelled",
          discount: 0, // Setting fixed discount to 0
          createdAt: entry.createdat,
          updatedAt: entry.updatedat,
          items: mappedItems
        } as StockEntry;
      })
    );
      
    return entriesWithItems;
  } catch (err) {
    console.error('Error fetching stock entries:', err);
    return [];
  }
}

// Create a new stock entry
export async function createStockEntry(entryData: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber'>): Promise<StockEntry | null> {
  try {
    const entryNumber = await generateStockEntryNumber();
    
    const newEntry: StockEntry = {
      id: uuidv4(),
      ...entryData,
      entryNumber,
      status: 'completed',
      discount: 0, // Setting fixed discount to 0
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert entry data
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
        discount: 0, // Setting fixed discount to 0
        createdat: newEntry.createdAt,
        updatedat: newEntry.updatedAt
      });
    
    if (error) {
      console.error('Error creating stock entry:', error);
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
        discount: item.discount || 0 // Ensure discount is provided or set to 0
      }));
      
      const { error: itemsError } = await supabase
        .from('StockEntriesItems')
        .insert(entryItems);
      
      if (itemsError) {
        console.error('Error creating stock entry items:', itemsError);
      }
    }
    
    return newEntry;
  } catch (error) {
    console.error('Error in createStockEntry:', error);
    return null;
  }
}

// Fetch all stock exits
export async function fetchStockExits(): Promise<StockExit[]> {
  try {
    const { data: exitsData, error: exitsError } = await supabase
      .from('StockExits')
      .select('*')
      .order('createdat', { ascending: false });

    if (exitsError) {
      throw exitsError;
    }

    if (!exitsData) {
      throw new Error("No stock exits found");
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
            status: exit.status as "pending" | "completed" | "cancelled",
            discount: 0, // Setting fixed discount to 0
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
          discount: item.discount || 0 // Add fallback to 0 if discount is missing
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
          status: exit.status as "pending" | "completed" | "cancelled",
          discount: 0, // Setting fixed discount to 0
          fromOrderId: exit.fromorderid,
          createdAt: exit.createdat,
          updatedAt: exit.updatedat,
          items: mappedItems
        } as StockExit;
      })
    );
      
    return exitsWithItems;
  } catch (err) {
    console.error('Error fetching stock exits:', err);
    return [];
  }
}

// Create a new stock exit
export async function createStockExit(exitData: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>): Promise<StockExit | null> {
  try {
    const exitNumber = await generateStockExitNumber();
    
    const newExit: StockExit = {
      id: uuidv4(),
      ...exitData,
      exitNumber,
      status: 'completed',
      discount: 0, // Setting fixed discount to 0
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert exit data
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
        discount: 0, // Setting fixed discount to 0
        fromorderid: newExit.fromOrderId,
        createdat: newExit.createdAt,
        updatedat: newExit.updatedAt
      });
    
    if (error) {
      console.error('Error creating stock exit:', error);
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
        discount: item.discount || 0 // Ensure discount is provided or set to 0
      }));
      
      const { error: itemsError } = await supabase
        .from('StockExitsItems')
        .insert(exitItems);
      
      if (itemsError) {
        console.error('Error creating stock exit items:', itemsError);
      }
    }
    
    return newExit;
  } catch (error) {
    console.error('Error in createStockExit:', error);
    return null;
  }
}

// Update an existing stock entry
export async function updateStockEntry(id: string, updates: Partial<StockEntry>): Promise<StockEntry | null> {
  try {
    // Update entry data
    const { error } = await supabase
      .from('StockEntries')
      .update({
        supplierid: updates.supplierId,
        suppliername: updates.supplierName,
        date: updates.date,
        invoicenumber: updates.invoiceNumber,
        notes: updates.notes,
        status: updates.status,
        discount: 0, // Setting fixed discount to 0
        updatedat: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating stock entry:', error);
      throw error;
    }
    
    // Fetch the updated entry
    const { data: updatedEntryData, error: fetchError } = await supabase
      .from('StockEntries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated stock entry:', fetchError);
      return null;
    }
    
    // Fetch items for the updated entry
    const { data: itemsData, error: itemsError } = await supabase
      .from('StockEntriesItems')
      .select('*')
      .eq('entryid', id);
    
    if (itemsError) {
      console.error(`Error fetching items for entry ${id}:`, itemsError);
      return null;
    }
    
    // Map items to the expected format
    const mappedItems = (itemsData || []).map(item => ({
      productId: item.productid,
      productName: item.productname,
      quantity: item.quantity,
      purchasePrice: item.purchaseprice,
      discount: item.discount || 0 // Add fallback to 0 if discount is missing
    }));
    
    // Return the updated entry with its mapped items
    const updatedEntry: StockEntry = {
      id: updatedEntryData.id,
      supplierId: updatedEntryData.supplierid,
      supplierName: updatedEntryData.suppliername,
      entryNumber: updatedEntryData.entrynumber,
      date: updatedEntryData.date,
      invoiceNumber: updatedEntryData.invoicenumber,
      notes: updatedEntryData.notes,
      status: updatedEntryData.status as "pending" | "completed" | "cancelled",
      discount: 0, // Setting fixed discount to 0
      createdAt: updatedEntryData.createdat,
      updatedAt: updatedEntryData.updatedat,
      items: mappedItems
    };
    
    return updatedEntry;
  } catch (error) {
    console.error('Error in updateStockEntry:', error);
    return null;
  }
}

// Update an existing stock exit
export async function updateStockExit(id: string, updates: Partial<StockExit>): Promise<StockExit | null> {
  try {
    // Update exit data
    const { error } = await supabase
      .from('StockExits')
      .update({
        clientid: updates.clientId,
        clientname: updates.clientName,
        reason: updates.reason,
        date: updates.date,
        invoicenumber: updates.invoiceNumber,
        notes: updates.notes,
        status: updates.status,
        discount: 0, // Setting fixed discount to 0
        fromorderid: updates.fromOrderId,
        updatedat: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating stock exit:', error);
      throw error;
    }
    
    // Fetch the updated exit
    const { data: updatedExitData, error: fetchError } = await supabase
      .from('StockExits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated stock exit:', fetchError);
      return null;
    }
    
    // Fetch items for the updated exit
    const { data: itemsData, error: itemsError } = await supabase
      .from('StockExitsItems')
      .select('*')
      .eq('exitid', id);
    
    if (itemsError) {
      console.error(`Error fetching items for exit ${id}:`, itemsError);
      return null;
    }
    
    // Map items to the expected format
    const mappedItems = (itemsData || []).map(item => ({
      productId: item.productid,
      productName: item.productname,
      quantity: item.quantity,
      salePrice: item.saleprice,
      discount: item.discount || 0 // Add fallback to 0 if discount is missing
    }));
    
    // Return the updated exit with its mapped items
    const updatedExit: StockExit = {
      id: updatedExitData.id,
      clientId: updatedExitData.clientid,
      clientName: updatedExitData.clientname,
      reason: updatedExitData.reason,
      exitNumber: updatedExitData.exitnumber,
      date: updatedExitData.date,
      invoiceNumber: updatedExitData.invoicenumber,
      notes: updatedExitData.notes,
      status: updatedExitData.status as "pending" | "completed" | "cancelled",
      discount: 0, // Setting fixed discount to 0
      fromOrderId: updatedExitData.fromorderid,
      createdAt: updatedExitData.createdat,
      updatedAt: updatedExitData.updatedat,
      items: mappedItems
    };
    
    return updatedExit;
  } catch (error) {
    console.error('Error in updateStockExit:', error);
    return null;
  }
}

// Delete an existing stock entry
export async function deleteStockEntry(id: string): Promise<boolean> {
  try {
    // Delete entry items
    const { error: itemsError } = await supabase
      .from('StockEntriesItems')
      .delete()
      .eq('entryid', id);
    
    if (itemsError) {
      console.error('Error deleting stock entry items:', itemsError);
      return false;
    }
    
    // Delete entry
    const { error } = await supabase
      .from('StockEntries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting stock entry:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteStockEntry:', error);
    return false;
  }
}

// Delete an existing stock exit
export async function deleteStockExit(id: string): Promise<boolean> {
  try {
    // Delete exit items
    const { error: itemsError } = await supabase
      .from('StockExitsItems')
      .delete()
      .eq('exitid', id);
    
    if (itemsError) {
      console.error('Error deleting stock exit items:', itemsError);
      return false;
    }
    
    // Delete exit
    const { error } = await supabase
      .from('StockExits')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting stock exit:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteStockExit:', error);
    return false;
  }
}
