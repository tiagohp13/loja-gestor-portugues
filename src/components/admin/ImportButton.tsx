import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportDataType } from "@/types";
import { useDataImport } from "@/hooks/useDataImport";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportButtonProps {
  type: ExportDataType;
  label: string;
  onSuccess?: () => void;
}

export const ImportButton: React.FC<ImportButtonProps> = ({ type, label, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData, isImporting } = useDataImport();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);

      try {
        const parsed = JSON.parse(content);
        const dataArray = Array.isArray(parsed) ? parsed : [parsed];
        
        setPreviewData({
          count: dataArray.length,
          sample: dataArray.slice(0, 3),
          valid: true,
        });
        setIsOpen(true);
      } catch {
        setPreviewData({
          count: 0,
          sample: [],
          valid: false,
          error: "Ficheiro JSON inválido",
        });
        setIsOpen(true);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!fileContent) return;

    const result = await importData(type, fileContent);
    
    if (result.success) {
      setIsOpen(false);
      setPreviewData(null);
      setFileContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess?.();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPreviewData(null);
    setFileContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        <Upload className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar Importação</DialogTitle>
            <DialogDescription>
              Reveja os dados antes de importar
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4">
              {previewData.valid ? (
                <>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{previewData.count}</strong> registos encontrados
                    </AlertDescription>
                  </Alert>

                  {previewData.sample.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Pré-visualização (primeiros 3 registos):</p>
                      <div className="bg-muted rounded-md p-3 max-h-64 overflow-y-auto">
                        <pre className="text-xs">
                          {JSON.stringify(previewData.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Os dados serão validados antes da importação. Registos inválidos serão ignorados.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {previewData.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isImporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={!previewData?.valid || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A importar...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
