
// Inside the handleSubmit function
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  addCategory({
    name,
    description,
    status: 'active'  // Add the required status field
  });
  
  navigate('/categorias/consultar');
};
