// ... (todo o restante código permanece igual)

<TableBody>
  {sortedExits.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
        Nenhuma saída de stock encontrada
      </TableCell>
    </TableRow>
  ) : (
    sortedExits.map((exit) => (
      <TableRow 
        key={exit.id} 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => handleViewExit(exit.id)}
      >
        <TableCell
          onClick={() => navigate(`/saidas/${exit.id}`)}
          className="font-medium text-blue-500 cursor-pointer hover:underline"
        >
          {exit.number}
        </TableCell>
        <TableCell>{formatDate(exit.date)}</TableCell>
        <TableCell>{exit.clientName}</TableCell>
        <TableCell>{exit.invoiceNumber || '-'}</TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(calculateExitTotal(exit))}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => handleViewExit(exit.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => handleEditExit(e, exit.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => confirmDeleteExit(e, exit.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>

