import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedSuppliers } from "@/hooks/queries/usePaginatedSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const SupplierNew = () => {
  const navigate = useNavigate();
  const { createSupplier } = usePaginatedSuppliers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("O nome do fornecedor é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      createSupplier({
        name,
        email,
        phone,
        address,
        taxId,
        notes,
        paymentTerms,
        status: "active",
      }, {
        onSuccess: () => {
          navigate("/fornecedores/consultar");
        },
        onError: (error: any) => {
          console.error("Erro ao adicionar fornecedor:", error);
          toast.error("Erro ao adicionar fornecedor");
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      toast.error("Erro ao adicionar fornecedor");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader
        title="Novo Fornecedor"
        description="Adicione um novo fornecedor ao sistema"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate("/fornecedores/consultar")} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "A guardar..." : "Guardar Fornecedor"}
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
                Nome
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gestorApp-gray-dark">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gestorApp-gray-dark">
                Telefone
              </label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="912 345 678" />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gestorApp-gray-dark">
                NIF
              </label>
              <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="123456789" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gestorApp-gray-dark">
              Morada
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Morada completa"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="paymentTerms" className="text-sm font-medium text-gestorApp-gray-dark">
              Condições de Pagamento
            </label>
            <Input
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="30 dias, pronto pagamento, etc."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre o fornecedor"
              rows={4}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierNew;
