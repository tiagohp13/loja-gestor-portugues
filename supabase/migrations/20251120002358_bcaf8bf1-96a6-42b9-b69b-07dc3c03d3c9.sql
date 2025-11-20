-- Eliminar itens das requisições primeiro
DELETE FROM requisicao_itens;

-- Eliminar requisições
DELETE FROM requisicoes;

-- Resetar contador
UPDATE counters 
SET current_count = 0, 
    last_number = 0, 
    updated_at = now() 
WHERE counter_type = 'requisicoes' AND year = 2025;