import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React, { useState } from "react";

/**
 * Componente de exemplo para testar interação de botão
 */
const SaveButton: React.FC = () => {
  const [saving, setSaving] = useState(false);
  
  return (
    <button onClick={() => setSaving(true)}>
      {saving ? "A guardar..." : "Guardar"}
    </button>
  );
};

describe("SaveButton", () => {
  it("mostra 'A guardar...' depois de clicar", () => {
    const { getByText } = render(<SaveButton />);
    const button = getByText("Guardar");
    button.click();
    expect(getByText("A guardar...")).toBeDefined();
  });

  it("inicia com o texto 'Guardar'", () => {
    const { getByText } = render(<SaveButton />);
    expect(getByText("Guardar")).toBeDefined();
  });

  it("botão deve ser clicável", () => {
    const { getByText } = render(<SaveButton />);
    const button = getByText("Guardar") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
