# Testes Automatizados

Este projeto usa **Vitest** e **React Testing Library** para testes automatizados.

## Executar os testes

```bash
npm run test
```

## Estrutura de testes

### `setup.ts`
Configuração global dos testes. Carrega matchers do `@testing-library/jest-dom`.

### `calculateOrderTotal.test.ts`
Testes unitários para validar cálculos de totais de encomendas.

### `SaveButton.test.tsx`
Teste de componente React. Valida renderização e interação de botão.

### `calculations.test.ts`
Suite completa de testes para regras de negócio:
- Cálculos de descontos (por item e global)
- Gestão de stock (entradas e saídas)
- Cálculos de totais com múltiplos itens

## Adicionar novos testes

1. Criar ficheiro com extensão `.test.ts` ou `.test.tsx` em `src/tests/`
2. Importar `describe`, `it`, `expect` do Vitest
3. Para componentes React, importar `render` do React Testing Library

### Exemplo de teste unitário

```typescript
import { describe, it, expect } from "vitest";

describe("minhaFuncao", () => {
  it("deve retornar valor esperado", () => {
    expect(minhaFuncao(1, 2)).toBe(3);
  });
});
```

### Exemplo de teste de componente

```typescript
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MeuComponente from "@/components/MeuComponente";

describe("MeuComponente", () => {
  it("deve renderizar corretamente", () => {
    const { getByText } = render(<MeuComponente />);
    expect(getByText("Texto esperado")).toBeDefined();
  });
});
```

## Próximos passos

Áreas críticas a cobrir com testes:
- ✅ Cálculos de totais e descontos
- ✅ Gestão de stock
- ⏳ Validação de formulários
- ⏳ Permissões de utilizador
- ⏳ CRUD de produtos, clientes, fornecedores
- ⏳ Conversão de encomendas em vendas
- ⏳ Cálculos de KPIs do dashboard

## Recursos

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library - Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
