
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, countPendingOrders, getLowStockProducts, getClientTotalSpent } from '@/integrations/supabase/client';
import { useData } from '@/contexts/DataContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Suporte = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente virtual do Gestor de Stock. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const { clients, products } = useData();

  // Load data for contextual responses
  useEffect(() => {
    const loadContextData = async () => {
      // Count pending orders
      const count = await countPendingOrders();
      setPendingOrdersCount(count);
      
      // Get low stock products
      const lowStock = await getLowStockProducts();
      setLowStockProducts(lowStock);
    };
    
    loadContextData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare context for more personalized responses
      const context = {
        pendingOrdersCount,
        lowStockProducts: lowStockProducts.map(p => `${p.name} (${p.current_stock}/${p.min_stock})`).join(', '),
        totalProducts: products.length,
        totalClients: clients.length
      };
      
      // Generate response based on user input
      let assistantResponse = "";
      
      // Process common queries with context data
      const query = input.toLowerCase();
      
      if (query.includes('encomendas pendentes') || query.includes('pedidos pendentes')) {
        assistantResponse = `Atualmente há ${pendingOrdersCount} encomendas pendentes.`;
      }
      else if (query.includes('stock baixo') || query.includes('produtos com pouco stock')) {
        if (lowStockProducts.length > 0) {
          assistantResponse = `Produtos com stock abaixo do mínimo: ${context.lowStockProducts}`;
        } else {
          assistantResponse = "Não há produtos com stock abaixo do mínimo neste momento.";
        }
      }
      else if (query.includes('total de produtos')) {
        assistantResponse = `O inventário atual tem ${context.totalProducts} produtos.`;
      }
      else if (query.includes('total de clientes')) {
        assistantResponse = `A base de dados tem ${context.totalClients} clientes registados.`;
      }
      else if (query.includes('valor gasto por') || query.includes('quanto gastou')) {
        // Extract client name from query if possible
        const clientMatches = clients.filter(client => 
          query.toLowerCase().includes(client.name.toLowerCase())
        );
        
        if (clientMatches.length > 0) {
          const client = clientMatches[0];
          const totalSpent = await getClientTotalSpent(client.id);
          assistantResponse = `O cliente ${client.name} gastou um total de ${totalSpent.toFixed(2)}€ até ao momento.`;
        } else {
          assistantResponse = "Para saber o valor gasto por um cliente, por favor mencione o nome do cliente na sua pergunta.";
        }
      }
      else {
        // Fallback message
        assistantResponse = `Baseado nos dados atuais do sistema: Temos ${pendingOrdersCount} encomendas pendentes e ${lowStockProducts.length} produtos com stock baixo. Como posso ajudar mais especificamente com a gestão do inventário?`;
      }
      
      // Add assistant message
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar a sua pergunta. Por favor, tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="text-gray-500">Assistente virtual para ajuda com o Gestor de Stock</p>
      </div>
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Assistente de Suporte</CardTitle>
          <CardDescription>
            Faça perguntas sobre o sistema, consulte dados ou peça ajuda.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-md">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-green-500">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-white border">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <p className="text-sm">O assistente está a escrever...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva a sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Suporte;
