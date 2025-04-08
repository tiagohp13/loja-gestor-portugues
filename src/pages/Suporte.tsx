
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { MessageSquare, Bot, User, Search } from 'lucide-react';

const Suporte = () => {
  const { clients, stockExits } = useData();
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'system' | 'user' | 'assistant'; content: string }[]>([
    {
      role: 'system',
      content: 'Sou um assistente para o seu negócio. Posso analisar os seus dados e dar dicas sobre vendas e clientes.'
    },
    {
      role: 'assistant',
      content: 'Olá! Sou o seu assistente de negócios. Posso ajudar com análises de vendas e sugestões para melhorar o seu negócio. Pergunte-me sobre os seus clientes, vendas ou qualquer outra dúvida que tenha!'
    }
  ]);
  
  // Find inactive clients (no purchases in the last 30 days)
  useEffect(() => {
    const generateInitialInsights = async () => {
      // Only execute if we have clients and stock exits
      if (clients.length === 0 || stockExits.length === 0) return;
      
      setIsLoading(true);
      
      try {
        // Get the current date
        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);
        
        // Find clients with no purchases in the last 30 days
        const clientPurchases = new Map();
        
        // Record the most recent purchase for each client
        stockExits.forEach(exit => {
          const exitDate = new Date(exit.date);
          if (!clientPurchases.has(exit.clientId) || 
              new Date(clientPurchases.get(exit.clientId).date) < exitDate) {
            clientPurchases.set(exit.clientId, {
              date: exit.date,
              name: exit.clientName
            });
          }
        });
        
        // Find inactive clients
        const inactiveClients = [];
        
        for (const client of clients) {
          const lastPurchase = clientPurchases.get(client.id);
          if (!lastPurchase || new Date(lastPurchase.date) < thirtyDaysAgo) {
            inactiveClients.push({
              id: client.id,
              name: client.name,
              lastPurchaseDate: lastPurchase ? new Date(lastPurchase.date).toLocaleDateString() : 'Nunca'
            });
          }
        }
        
        // Analyze top selling products
        const productSales = new Map();
        
        stockExits.forEach(exit => {
          const productId = exit.productId;
          if (!productSales.has(productId)) {
            productSales.set(productId, {
              name: exit.productName,
              quantity: 0,
              revenue: 0
            });
          }
          
          const currentProduct = productSales.get(productId);
          currentProduct.quantity += exit.quantity;
          currentProduct.revenue += exit.quantity * exit.salePrice;
          productSales.set(productId, currentProduct);
        });
        
        // Sort products by revenue
        const sortedProducts = Array.from(productSales.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3);
        
        // Create insights message
        let insightsMessage = '';
        
        if (inactiveClients.length > 0) {
          insightsMessage += `Identifiquei ${inactiveClients.length} clientes que não fizeram compras nos últimos 30 dias. `;
          insightsMessage += `Os principais são: ${inactiveClients.slice(0, 3).map(c => c.name).join(', ')}.\n\n`;
        }
        
        if (sortedProducts.length > 0) {
          insightsMessage += `Os produtos mais vendidos são: \n`;
          sortedProducts.forEach((product, index) => {
            insightsMessage += `${index + 1}. ${product.name} - Quantidade: ${product.quantity}, Receita: ${product.revenue.toFixed(2)}€\n`;
          });
        }
        
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Aqui estão algumas informações sobre o seu negócio:\n\n${insightsMessage}\n\nPosso ajudar com mais alguma coisa?`
          }
        ]);
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateInitialInsights();
  }, [clients, stockExits]);
  
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Add user message to the chat
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    
    try {
      // This is a mockup simulation of an AI response for demonstration purposes
      // In a real implementation, you would use an API call to ChatGPT
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage = await generateAIResponse(newUserMessage.content);
      
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: aiMessage }
      ]);
    } catch (error) {
      toast.error('Erro ao comunicar com o assistente de IA.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock function to simulate AI response
  const generateAIResponse = async (message: string): Promise<string> => {
    // In a real implementation, you would call the ChatGPT API here
    // For now, we'll return a canned response based on the query
    
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('cliente') && (messageLower.includes('inativo') || messageLower.includes('não compra'))) {
      return `Baseado nos dados, recomendo entrar em contato com os clientes inativos para entender suas necessidades atuais. Considere oferecer um desconto especial para reconquistar estes clientes. Algumas razões para a inatividade podem incluir:
      
1. Encontraram um concorrente
2. Não estão satisfeitos com algum aspecto do produto/serviço
3. Mudança nas necessidades de compra
      
Uma campanha de email personalizada ou ligação direta pode ser eficaz para reengajá-los.`;
    } 
    else if (messageLower.includes('venda') || messageLower.includes('produto') && messageLower.includes('popular')) {
      return `Analisando suas vendas recentes, percebo que você poderia aumentar a rentabilidade focando nos seus produtos mais vendidos. Considere:
      
1. Aumentar o estoque dos produtos populares para evitar falta
2. Criar pacotes ou bundles com esses produtos
3. Oferecer descontos em volumes maiores
      
Recomendo também verificar se os preços estão otimizados - um pequeno aumento nos produtos mais populares pode resultar em aumento significativo nas receitas sem impactar muito as vendas.`;
    }
    else if (messageLower.includes('tendência') || messageLower.includes('padrão')) {
      return `Identificando padrões de compra nos seus dados:
      
1. Os clientes tendem a comprar mais no início e fim do mês
2. Produtos comprados frequentemente juntos poderiam ser oferecidos em pacotes
3. Há uma sazonalidade em alguns produtos que poderia ser explorada com promoções antecipadas
      
Recomendo criar uma estratégia de marketing que considere estes padrões para maximizar as vendas.`;
    }
    else {
      return `Obrigado pela sua pergunta. Para lhe dar uma resposta mais precisa, eu precisaria analisar mais dados do seu negócio. Posso ajudar com:

1. Identificação de padrões de compra
2. Análise de clientes inativos
3. Recomendações para aumentar vendas de produtos específicos
4. Tendências e sazonalidade

Por favor, pergunte sobre algum desses tópicos para que eu possa fornecer uma análise mais detalhada.`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Suporte Inteligente" 
        description="Assistente IA para análise de clientes e vendas"
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gestorApp-blue text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Assistente de Negócios</span>
        </div>
        
        <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 flex flex-col space-y-4">
          {messages.filter(m => m.role !== 'system').map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-gestorApp-blue text-white' 
                    : 'bg-gray-100 text-gestorApp-gray-dark'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.role === 'user' 
                    ? <User className="w-4 h-4" /> 
                    : <Bot className="w-4 h-4" />
                  }
                  <span className="font-medium">
                    {message.role === 'user' ? 'Você' : 'Assistente'}
                  </span>
                </div>
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gestorApp-gray-dark">
                <div className="flex items-center space-x-2 mb-1">
                  <Bot className="w-4 h-4" />
                  <span className="font-medium">Assistente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gestorApp-blue rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gestorApp-blue rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gestorApp-blue rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Envie sua mensagem..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              Enviar
            </Button>
          </div>
          <div className="mt-2 text-xs text-gestorApp-gray">
            <p>Sugestões de perguntas:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                onClick={() => setUserMessage("Quais clientes não compram há muito tempo?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200"
              >
                Clientes inativos
              </button>
              <button
                onClick={() => setUserMessage("Quais são os produtos mais populares?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200"
              >
                Produtos populares
              </button>
              <button
                onClick={() => setUserMessage("Alguma tendência ou padrão nas compras?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200"
              >
                Tendências de compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suporte;
