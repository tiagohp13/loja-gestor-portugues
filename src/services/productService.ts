
import { v4 as uuidv4 } from 'uuid';
import { Product, StockEntry, StockExit } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Load products from localStorage or create an empty array
const loadProducts = (): Product[] => {
  try {
    const productsData = localStorage.getItem('products');
    return productsData ? JSON.parse(productsData) : [];
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return [];
  }
};

// Save products to localStorage
const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  // First, try to get from localStorage
  const localProducts = loadProducts();
  
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('Produtos')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      // Map the data to our expected format
      const mappedProducts = data.map(product => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        category: product.category,
        purchasePrice: product.purchaseprice,
        salePrice: product.saleprice,
        currentStock: product.currentstock,
        minStock: product.minstock,
        supplierId: product.supplierid,
        supplierName: product.suppliername,
        createdAt: product.createdat,
        updatedAt: product.updatedat
      })) as Product[];
      
      // Save to localStorage for offline use
      saveProducts(mappedProducts);
      
      return mappedProducts;
    }
    
    return localProducts;
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    // Return localStorage data as fallback
    return localProducts;
  }
};

// Add a new product
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const newProduct: Product = {
    id: uuidv4(),
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase
      .from('Produtos')
      .insert({
        id: newProduct.id,
        code: newProduct.code,
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        purchaseprice: newProduct.purchasePrice,
        saleprice: newProduct.salePrice,
        currentstock: newProduct.currentStock,
        minstock: newProduct.minStock,
        supplierid: newProduct.supplierId,
        suppliername: newProduct.supplierName,
        createdat: newProduct.createdAt,
        updatedat: newProduct.updatedAt
      });
    
    if (error) {
      console.error('Error saving product to Supabase:', error);
      throw error;
    }
    
    // Update localStorage
    const products = loadProducts();
    saveProducts([...products, newProduct]);
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Save locally as fallback
    const products = loadProducts();
    saveProducts([...products, newProduct]);
    
    return newProduct;
  }
};

// Update a product
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const products = loadProducts();
  const productIndex = products.findIndex(product => product.id === id);
  
  if (productIndex === -1) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('Produtos')
      .update({
        code: updatedProduct.code,
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        purchaseprice: updatedProduct.purchasePrice,
        saleprice: updatedProduct.salePrice,
        currentstock: updatedProduct.currentStock,
        minstock: updatedProduct.minStock,
        supplierid: updatedProduct.supplierId,
        suppliername: updatedProduct.supplierName,
        updatedat: updatedProduct.updatedAt
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating product in Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    // Continue with local update even if Supabase fails
  }
  
  // Save to localStorage
  saveProducts(products);
  
  return updatedProduct;
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  const products = loadProducts();
  const filteredProducts = products.filter(product => product.id !== id);
  
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('Produtos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    // Continue with local delete even if Supabase fails
  }
  
  // Save to localStorage
  saveProducts(filteredProducts);
};

// Get a product by ID
export const getProduct = (id: string, products: Product[]): Product | undefined => {
  return products.find(product => product.id === id);
};

// Get product history (stocks entries and exits)
export const getProductHistory = (id: string, stockEntries: StockEntry[], stockExits: StockExit[]): { entries: StockEntry[], exits: StockExit[] } => {
  const entries = stockEntries.filter(entry => entry.items.some(item => item.productId === id));
  const exits = stockExits.filter(exit => exit.items.some(item => item.productId === id));
  return { entries, exits };
};

// Update product stock quantity
export const updateProductStock = async (productId: string, quantityChange: number, products: Product[]): Promise<Product[]> => {
  const updatedProducts = products.map(product => {
    if (product.id === productId) {
      const newStock = product.currentStock + quantityChange;
      return { 
        ...product, 
        currentStock: newStock >= 0 ? newStock : 0, 
        updatedAt: new Date().toISOString() 
      };
    }
    return product;
  });
  
  const productToUpdate = updatedProducts.find(p => p.id === productId);
  
  if (productToUpdate) {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('Produtos')
        .update({
          currentstock: productToUpdate.currentStock,
          updatedat: productToUpdate.updatedAt
        })
        .eq('id', productId);
      
      if (error) {
        console.error('Error updating product stock in Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
      // Continue with local update even if Supabase fails
    }
  }
  
  // Save to localStorage
  saveProducts(updatedProducts);
  
  return updatedProducts;
};
