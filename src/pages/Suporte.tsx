
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { MessageSquare, Bot, User, Search, TrendingUp, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

const Suporte = () => {
  const { clients, stockExits, getBusinessAnalytics } = useData();
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
  
  // Generate business insights on component mount
  useEffect(() => {
    const generateBusinessInsights = async () => {
      if (clients.length === 0 || stockExits.length === 0) return;
      
      setIsLoading(true);
      
      try {
        const analytics = getBusinessAnalytics();
        
        let insightsMessage = '';
        
        // Revenue and profit insights
        insightsMessage += `**Resumo Financeiro:**\n`;
        insightsMessage += `- Receita Total: ${analytics.summary.totalRevenue.toFixed(2)}€\n`;
        insightsMessage += `- Lucro Total: ${analytics.summary.totalProfit.toFixed(2)}€\n`;
        insightsMessage += `- Margem de Lucro: ${analytics.summary.profitMargin.toFixed(2)}%\n`;
        insightsMessage += `- Valor atual do inventário: ${analytics.summary.currentStockValue.toFixed(2)}€\n\n`;
        
        // Top selling products
        if (analytics.topSellingProducts.length > 0) {
          insightsMessage += `**Produtos Mais Vendidos:**\n`;
          analytics.topSellingProducts.forEach((product, index) => {
            insightsMessage += `${index + 1}. ${product.name} - ${product.totalQuantity} unidades (${product.totalRevenue.toFixed(2)}€)\n`;
          });
          insightsMessage += '\n';
        }
        
        // Most profitable products
        if (analytics.mostProfitableProducts.length > 0) {
          insightsMessage += `**Produtos Mais Lucrativos:**\n`;
          analytics.mostProfitableProducts.forEach((product, index) => {
            insightsMessage += `${index + 1}. ${product.name} - ${product.totalRevenue.toFixed(2)}€\n`;
          });
          insightsMessage += '\n';
        }
        
        // Top clients
        if (analytics.topClients.length > 0) {
          insightsMessage += `**Melhores Clientes:**\n`;
          analytics.topClients.forEach((client, index) => {
            insightsMessage += `${index + 1}. ${client.name} - ${client.totalSpent.toFixed(2)}€ (${client.purchaseCount} compras)\n`;
          });
          insightsMessage += '\n';
        }
        
        // Low stock warnings
        if (analytics.lowStockProducts.length > 0) {
          insightsMessage += `**Alerta de Stock Baixo:**\n`;
          analytics.lowStockProducts.forEach((product, index) => {
            insightsMessage += `${index + 1}. ${product.name} (${product.code}) - Stock: ${product.currentStock}/${product.minStock}\n`;
          });
          insightsMessage += '\n';
        }
        
        // Inactive clients
        if (analytics.inactiveClients.length > 0) {
          insightsMessage += `**Clientes Inativos (sem compras nos últimos 30 dias):**\n`;
          const inactiveCount = analytics.inactiveClients.length;
          insightsMessage += `Existem ${inactiveCount} clientes inativos. Os principais são:\n`;
          analytics.inactiveClients.slice(0, 5).forEach((client, index) => {
            insightsMessage += `${index + 1}. ${client.name} - Última compra: ${client.lastPurchaseDate === 'Nunca' ? 'Nunca' : new Date(client.lastPurchaseDate).toLocaleDateString()}\n`;
          });
        }
        
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Aqui está uma análise detalhada do seu negócio:\n\n${insightsMessage}\n\nPosso ajudar com mais alguma informação específica?`
          }
        ]);
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateBusinessInsights();
  }, [clients, stockExits, getBusinessAnalytics]);
  
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Add user message to the chat
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    
    try {
      // Generate AI response based on the user question and business analytics
      const analytics = getBusinessAnalytics();
      const aiMessage = await generateAIResponse(newUserMessage.content, analytics);
      
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
  
  // Function to generate AI responses based on business analytics
  const generateAIResponse = async (message: string, analytics: any): Promise<string> => {
    const messageLower = message.toLowerCase();
    
    // Financial analysis
    if (messageLower.includes('finan') || messageLower.includes('lucro') || messageLower.includes('receita') || messageLower.includes('margem')) {
      return `**Análise Financeira**

Receita Total: ${analytics.summary.totalRevenue.toFixed(2)}€
Custo Total: ${analytics.summary.totalCost.toFixed(2)}€
Lucro Total: ${analytics.summary.totalProfit.toFixed(2)}€
Margem de Lucro: ${analytics.summary.profitMargin.toFixed(2)}%

Esta margem de lucro ${analytics.summary.profitMargin > 20 ? 'está saudável' : 'poderia ser melhorada'}. 
${analytics.summary.profitMargin < 15 
  ? 'Recomendo analisar os custos e considerar um ajuste nos preços de venda.'
  : 'Continue monitorando os custos para manter esta performance.'}

O valor atual do seu inventário é de ${analytics.summary.currentStockValue.toFixed(2)}€.`;
    }
    
    // Product analysis
    else if (messageLower.includes('produto') || messageLower.includes('vend') || messageLower.includes('popular')) {
      const topProducts = analytics.topSellingProducts;
      const profitProducts = analytics.mostProfitableProducts;
      
      return `**Análise de Produtos**

**Produtos Mais Vendidos:**
${topProducts.map((p: any, i: number) => `${i+1}. ${p.name} - ${p.totalQuantity} unidades vendidas (${p.totalRevenue.toFixed(2)}€)`).join('\n')}

**Produtos Mais Lucrativos:**
${profitProducts.map((p: any, i: number) => `${i+1}. ${p.name} - ${p.totalRevenue.toFixed(2)}€ em receita`).join('\n')}

**Recomendações:**
- Os produtos mais vendidos devem ser mantidos sempre em estoque
- Considere promoções para os produtos menos vendidos mas com boa margem
- Avalie aumentar levemente o preço dos produtos mais populares`;
    }
    
    // Client analysis
    else if (messageLower.includes('cliente') || messageLower.includes('compra')) {
      const topClients = analytics.topClients;
      const inactiveClients = analytics.inactiveClients;
      
      return `**Análise de Clientes**

**Melhores Clientes:**
${topClients.map((c: any, i: number) => `${i+1}. ${c.name} - ${c.totalSpent.toFixed(2)}€ (${c.purchaseCount} compras)`).join('\n')}

**Clientes Inativos (sem compras em 30 dias):**
- Total: ${inactiveClients.length} clientes
- Principais: ${inactiveClients.slice(0, 3).map((c: any) => c.name).join(', ')}

**Recomendações:**
- Ofereça descontos especiais para os melhores clientes fidelizando-os
- Crie uma campanha de reativação para os clientes inativos
- Implemente um programa de fidelidade para aumentar o valor médio por cliente`;
    }
    
    // Inventory/Stock analysis
    else if (messageLower.includes('stock') || messageLower.includes('inventário') || messageLower.includes('estoque')) {
      const lowStock = analytics.lowStockProducts;
      
      return `**Análise de Inventário**

**Valor Total do Inventário:** ${analytics.summary.currentStockValue.toFixed(2)}€

**Produtos com Estoque Baixo:**
${lowStock.length > 0 
  ? lowStock.map((p: any, i: number) => `${i+1}. ${p.name} (${p.code}) - Atual: ${p.currentStock}, Mínimo: ${p.minStock}`).join('\n')
  : 'Nenhum produto com estoque abaixo do mínimo.'}

**Recomendações:**
${lowStock.length > 0 
  ? '- Faça pedidos imediatos para repor o estoque dos itens indicados\n- Revise os níveis mínimos de estoque com base na demanda atual'
  : '- Continue monitorando seus níveis de estoque\n- Considere reduzir o estoque de produtos menos vendidos'}`;
    }
    
    // General recommendations
    else if (messageLower.includes('recomend') || messageLower.includes('sugest') || messageLower.includes('melhor')) {
      return `**Recomendações Estratégicas**

Com base na análise dos seus dados, recomendo:

1. **Gestão de Inventário**
   - Repor imediatamente os ${analytics.lowStockProducts.length} produtos com estoque baixo
   - Otimizar níveis de estoque baseado no histórico de vendas

2. **Clientes**
   - Lançar campanha para os ${analytics.inactiveClients.length} clientes inativos
   - Criar programa VIP para os top 5 clientes (representam ${(analytics.topClients.reduce((sum: number, c: any) => sum + c.totalSpent, 0) / analytics.summary.totalRevenue * 100).toFixed(1)}% da receita)

3. **Produtos**
   - Aumentar preço dos produtos mais vendidos em 3-5%
   - Criar pacotes/bundles com produtos complementares

4. **Marketing**
   - Direcionar promoções para produtos com menor rotatividade
   - Destacar produtos com melhor margem de lucro

Estas ações podem aumentar sua receita em aproximadamente 10-15% e melhorar a margem de lucro.`;
    }
    
    // General overview/summary
    else {
      return `**Resumo Geral do Negócio**

**Performance Financeira:**
- Receita Total: ${analytics.summary.totalRevenue.toFixed(2)}€
- Lucro Total: ${analytics.summary.totalProfit.toFixed(2)}€
- Margem de Lucro: ${analytics.summary.profitMargin.toFixed(2)}%

**Destaques:**
- Produto mais vendido: ${analytics.topSellingProducts[0]?.name || 'N/A'} (${analytics.topSellingProducts[0]?.totalQuantity || 0} unidades)
- Cliente que mais compra: ${analytics.topClients[0]?.name || 'N/A'} (${analytics.topClients[0]?.totalSpent.toFixed(2) || 0}€)
- Produtos com estoque baixo: ${analytics.lowStockProducts.length}
- Clientes inativos: ${analytics.inactiveClients.length}

Posso fornecer análises detalhadas sobre:
- Produtos (vendas, lucratividade)
- Clientes (comportamento de compra, inatividade)
- Finanças (receitas, custos, margens)
- Inventário (nível de estoque, alertas)

Me pergunte sobre qualquer um destes temas para informações específicas.`;
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
                onClick={() => setUserMessage("Como está a performance financeira do negócio?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200 flex items-center space-x-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Análise financeira</span>
              </button>
              <button
                onClick={() => setUserMessage("Quais são os produtos mais populares?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200 flex items-center space-x-1"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Produtos populares</span>
              </button>
              <button
                onClick={() => setUserMessage("Quais clientes estão inativos?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200 flex items-center space-x-1"
              >
                <Users className="w-3 h-3" />
                <span>Clientes inativos</span>
              </button>
              <button
                onClick={() => setUserMessage("Algum produto com estoque baixo?")}
                className="py-1 px-2 bg-gray-100 rounded-full text-gestorApp-gray-dark hover:bg-gray-200 flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Alertas de estoque</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suporte;
