
// Only the addStockExit function
const addStockExit = async (exitData: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>) => {
  const exitNumber = await generateStockExitNumber();
  
  const newExit: StockExit = {
    id: uuidv4(),
    ...exitData,
    exitNumber: exitNumber,
    status: 'completed',
    discount: exitData.discount || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    console.log('Guardando saída no Supabase:', newExit);
    
    // Inserir dados básicos da saída
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
      console.error('Erro ao salvar saída no Supabase:', error);
      throw error;
    }
    
    // Inserir itens da saída
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
        console.error('Erro ao salvar itens da saída no Supabase:', itemsError);
        // Continuar mesmo com erro para salvar outros itens
      }
    }
    
    console.log('Saída guardada com sucesso no Supabase');
  } catch (error) {
    console.error('Erro ao guardar saída:', error);
    // Continue saving locally even if Supabase fails
    console.warn('Salvando apenas localmente devido a erro no Supabase');
  }
  
  // Update product stock quantities (negative for exits)
  newExit.items.forEach(item => {
    updateProductStock(item.productId, -item.quantity);
  });
  
  // Save to local state
  setStockExits(prev => [newExit, ...prev]);
  saveData('stockExits', [...stockExits, newExit]);
  return newExit;
};
