import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { TrendingUp, TrendingDown, AlertTriangle, UserPlus, Target, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientInsightsData } from '../hooks/useClientInsightsData';
import { Client, StockExit } from '@/types';

interface ClientInsightsModalProps {
  type: 'inactive' | 'new' | 'top5' | 'avgSpent' | null;
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  stockExits: StockExit[];
}

const ClientInsightsModal: React.FC<ClientInsightsModalProps> = ({
  type,
  isOpen,
  onClose,
  clients,
  stockExits,
}) => {
  const data = useClientInsightsData(clients, stockExits);

  if (!type) return null;

  const renderInactiveContent = () => (
    <>
      <DialogDescription>
        Clientes que não efetuam compras há mais de 90 dias
      </DialogDescription>
      <div className="mt-4 space-y-4">
        {data.inactiveClients.length === 0 ? (
          <Alert>
            <AlertDescription>
              🎉 Não há clientes inativos há mais de 90 dias!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead className="text-right">Dias sem Comprar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.inactiveClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{formatDate(client.lastPurchaseDate)}</TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600 font-semibold">
                        {client.daysSinceLastPurchase} dias
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Sugestão:</strong> Considere reativar esses clientes com uma campanha ou promoção especial.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </>
  );

  const renderNewContent = () => (
    <>
      <DialogDescription>
        Clientes que fizeram a primeira compra nos últimos 30 dias
      </DialogDescription>
      <div className="mt-4 space-y-4">
        {data.newClients.length === 0 ? (
          <Alert>
            <AlertDescription>
              Nenhum novo cliente este mês.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data da Primeira Compra</TableHead>
                    <TableHead className="text-right">Valor Gasto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.newClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{formatDate(client.firstPurchaseDate)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Alert className="bg-green-50 border-green-200">
              <UserPlus className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Total gasto pelos novos clientes:</strong>{' '}
                {formatCurrency(data.newClients.reduce((sum, c) => sum + c.totalSpent, 0))}
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </>
  );

  const renderTop5Content = () => (
    <>
      <DialogDescription>
        Os 5 principais clientes por faturação do mês atual
      </DialogDescription>
      <div className="mt-4 space-y-4">
        {data.topClients.length === 0 ? (
          <Alert>
            <AlertDescription>
              Ainda não há vendas este mês.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-3">
              {data.topClients.map((client, index) => (
                <div key={client.id} className="space-y-2 p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(client.totalSpent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {client.percentage.toFixed(1)}% do total
                      </div>
                    </div>
                  </div>
                  <Progress value={client.percentage} className="h-2" />
                </div>
              ))}
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Concentração de receita:</strong> Os 5 principais clientes representam{' '}
                {data.topClients.reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}% do total faturado este mês.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </>
  );

  const renderAvgSpentContent = () => {
    const isIncrease = data.avgSpentChange > 0;
    const Icon = isIncrease ? TrendingUp : TrendingDown;
    const colorClass = isIncrease ? 'text-green-600' : 'text-red-600';
    const bgClass = isIncrease ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textClass = isIncrease ? 'text-green-800' : 'text-red-800';

    return (
      <>
        <DialogDescription>
          Comparação do valor médio gasto por cliente ativo
        </DialogDescription>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Mês Anterior</div>
              <div className="text-2xl font-bold">{formatCurrency(data.previousMonthAvg)}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Mês Atual</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(data.currentMonthAvg)}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-6 rounded-lg border bg-card">
            <Icon className={`h-8 w-8 mr-3 ${colorClass}`} />
            <div>
              <div className="text-sm text-muted-foreground">Variação face ao mês anterior</div>
              <div className={`text-3xl font-bold ${colorClass}`}>
                {isIncrease ? '+' : ''}{data.avgSpentChange.toFixed(1)}%
              </div>
            </div>
          </div>

          <Alert className={bgClass}>
            <DollarSign className={`h-4 w-4 ${colorClass}`} />
            <AlertDescription className={textClass}>
              <strong>{isIncrease ? 'Bom sinal!' : 'Atenção:'}</strong>{' '}
              {isIncrease 
                ? 'O ticket médio está em crescimento. Continue a estratégia atual.'
                : 'Avalie os produtos com menor margem ou quedas nas vendas. Pode ser necessário ajustar a estratégia comercial.'}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'inactive':
        return 'Clientes inativos há mais de 90 dias';
      case 'new':
        return 'Novos clientes deste mês';
      case 'top5':
        return 'Top 5 clientes do mês';
      case 'avgSpent':
        return 'Evolução do ticket médio';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'inactive':
        return renderInactiveContent();
      case 'new':
        return renderNewContent();
      case 'top5':
        return renderTop5Content();
      case 'avgSpent':
        return renderAvgSpentContent();
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ClientInsightsModal;
