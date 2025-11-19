import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePaginatedSuppliers } from "@/hooks/queries/usePaginatedSuppliers";
import { useSupplierQuery } from "@/hooks/queries/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const SupplierEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSupplier } = usePaginatedSuppliers();
  const { data: foundSupplier, isLoading } = useSupplierQuery(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    notes: "",
    paymentTerms: "",
  });

  useEffect(() => {
    if (foundSupplier) {
      setSupplier({
        name: foundSupplier.name || "",
        email: foundSupplier.email || "",
        phone: foundSupplier.phone || "",
        address: foundSupplier.address || "",
        taxId: foundSupplier.taxId || "",
        notes: foundSupplier.notes || "",
        paymentTerms: foundSupplier.paymentTerms || "",
      });
    } else if (!isLoading && id) {
      toast.error("Fornecedor não encontrado");
      navigate("/fornecedores/consultar");
    }
  }, [foundSupplier, isLoading, id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    updateSupplier({ id, ...supplier }, {
      onSuccess: () => {
        navigate(`/fornecedores/${id}`);
      },
      onError: (error: any) => {
        console.error("Erro ao atualizar fornecedor:", error);
        toast.error("Erro ao atualizar fornecedor");
        setIsSubmitting(false);
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Fornecedor"
        description="Atualize os detalhes do fornecedor"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate(`/fornecedores/${id}`)} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
                Nome
              </label>
              <Input
                id="name"
                name="name"
                value={supplier.name}
                onChange={handleChange}
                placeholder="Nome do fornecedor"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gestorApp-gray-dark">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={supplier.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gestorApp-gray-dark">
                Telefone
              </label>
              <Input
                id="phone"
                name="phone"
                value={supplier.phone}
                onChange={handleChange}
                placeholder="Número de telefone"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gestorApp-gray-dark">
                NIF
              </label>
              <Input
                id="taxId"
                name="taxId"
                value={supplier.taxId}
                onChange={handleChange}
                placeholder="Número de identificação fiscal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gestorApp-gray-dark">
              Morada
            </label>
            <Input
              id="address"
              name="address"
              value={supplier.address}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Observações
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={supplier.notes}
              onChange={handleChange}
              placeholder="Notas ou observações sobre o fornecedor"
              rows={4}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierEdit;
