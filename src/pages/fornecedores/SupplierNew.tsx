
// Inside the handleSubmit function
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  addSupplier({
    name,
    email,
    phone,
    address,
    taxId,
    notes,
    status: 'active'  // Add the required status field
  });
  
  navigate('/fornecedores/consultar');
};
