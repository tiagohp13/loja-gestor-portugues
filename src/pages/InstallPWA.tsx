import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Instalar Aqua Paraíso</CardTitle>
          <CardDescription className="text-base">
            Instale a aplicação no seu dispositivo para acesso rápido e offline
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium">Aplicação já instalada!</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Ir para o Dashboard
              </Button>
            </div>
          ) : isInstallable ? (
            <div className="space-y-4">
              <Button onClick={handleInstallClick} className="w-full h-12 text-lg" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Benefícios da instalação:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Acesso rápido a partir do ecrã inicial</li>
                  <li>• Funciona offline</li>
                  <li>• Experiência de aplicação nativa</li>
                  <li>• Sem necessidade de instalar da App Store</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">Como instalar no seu dispositivo:</p>
                <div className="space-y-3 mt-2">
                  <div>
                    <p className="font-medium text-foreground">iPhone/iPad:</p>
                    <ol className="ml-4 space-y-1 text-muted-foreground">
                      <li>1. Toque no ícone de partilha (□↑)</li>
                      <li>2. Selecione "Adicionar ao Ecrã Inicial"</li>
                      <li>3. Confirme tocando em "Adicionar"</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Android:</p>
                    <ol className="ml-4 space-y-1 text-muted-foreground">
                      <li>1. Toque no menu do navegador (⋮)</li>
                      <li>2. Selecione "Instalar aplicação" ou "Adicionar ao ecrã inicial"</li>
                      <li>3. Confirme a instalação</li>
                    </ol>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Continuar no Navegador
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPWA;
