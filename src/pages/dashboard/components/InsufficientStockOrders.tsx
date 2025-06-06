--- a/src/pages/dashboard/components/InsufficientStockOrders.tsx
+++ b/src/pages/dashboard/components/InsufficientStockOrders.tsx
@@ -15,12 +15,12 @@ const InsufficientStockOrders: React.FC<InsufficientStockOrdersProps> = ({
   if (insufficientItems.length === 0) {
     return (
       <Card>
-        <CardHeader>
-          <CardTitle className="text-lg font-semibold">
-            Encomendas com Stock Insuficiente
-          </CardTitle>
-        </CardHeader>
+        <CardHeader>
+          <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
+            Encomendas com Stock Insuficiente
+          </CardTitle>
+        </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground text-center py-4">
             Não existem encomendas com stock insuficiente.
           </p>
         </CardContent>
       </Card>
     );
   }

   return (
     <Card>
-      <CardHeader>
-        <CardTitle className="text-lg font-semibold">
-          Encomendas com Stock Insuficiente
-        </CardTitle>
-      </CardHeader>
+      <CardHeader>
+        <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
+          Encomendas com Stock Insuficiente
+        </CardTitle>
+      </CardHeader>
       <CardContent>
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead 
                   onClick={() => handleSort('order')} 
                   className="cursor-pointer"
                 >
                   <div className="flex items-center">
                     Encomenda {getSortIcon('order')}
                   </div>
                 </TableHead>
                 <TableHead 
                   onClick={() => handleSort('date')} 
                   className="cursor-pointer"
                 >
                   <div className="flex items-center">
                     Data {getSortIcon('date')}
                   </div>
                 </TableHead>
                 <TableHead 
                   onClick={() => handleSort('product')} 
                   className="cursor-pointer"
                 >
                   <div className="flex items-center">
                     Produto {getSortIcon('product')}
                   </div>
                 </TableHead>
                 <TableHead 
                   onClick={() => handleSort('missingQuantity')} 
                   className="cursor-pointer"
                 >
                   <div className="flex items-center">
                     Falta Comprar {getSortIcon('missingQuantity')}
                   </div>
                 </TableHead>
                 <TableHead 
                   onClick={() => handleSort('client')} 
                   className="cursor-pointer"
                 >
                   <div className="flex items-center">
                     Cliente {getSortIcon('client')}
                   </div>
                 </TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {sortedItems.map((item, index) => (
                 <TableRow key={`${item.order.id}-${item.product.id}-${index}`}>
                   <TableCell>
                     <button
                       onClick={() => navigateToOrderDetail(item.order.id)}
                       className="text-blue-500 hover:underline hover:cursor-pointer"
                     >
                       {item.order.number}
                     </button>
                   </TableCell>
                   <TableCell>
                     {format(new Date(item.order.date), "dd/MM/yyyy", { locale: pt })}
                   </TableCell>
                   <TableCell>
                     <button
                       onClick={() => navigateToProductDetail(item.product.id)}
                       className="text-blue-500 hover:underline hover:cursor-pointer"
                     >
                       {item.product.name}
                     </button>
                   </TableCell>
                   <TableCell className="text-red-500 font-medium">
                     <div className="flex items-center">
                       <AlertTriangle className="h-4 w-4 mr-1" />
                       {item.missingQuantity}
                     </div>
                   </TableCell>
                   <TableCell>
                     <button
                       onClick={() => navigateToClientDetail(item.order.clientId)}
                       className="text-blue-500 hover:underline hover:cursor-pointer"
                     >
                       {item.clientName}
                     </button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent>
     </Card>
   );
 };

 export default InsufficientStockOrders;
