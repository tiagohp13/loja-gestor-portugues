import { useState, useEffect } from 'react';
import { ClientTagConfig, DEFAULT_TAG_CONFIG } from '@/utils/clientTags';

const STORAGE_KEY = 'client-tag-config';

export const useClientTags = () => {
  const [config, setConfig] = useState<ClientTagConfig>(DEFAULT_TAG_CONFIG);

  useEffect(() => {
    // Carregar configuração do localStorage
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configuração das etiquetas:', error);
      }
    }
  }, []);

  const updateConfig = (newConfig: ClientTagConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return {
    config,
    updateConfig
  };
};