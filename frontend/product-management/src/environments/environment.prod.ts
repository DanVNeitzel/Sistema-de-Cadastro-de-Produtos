/**
 * Configurações do ambiente de produção
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api', // ✅ URL da API em produção
  useMockData: false, // ✅ Usar API real em produção
  apiTimeout: 30000,
  enableDebugMode: false
};
