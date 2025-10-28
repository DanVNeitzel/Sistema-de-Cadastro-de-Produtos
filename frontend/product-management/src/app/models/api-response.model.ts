/**
 * Interface genérica para respostas da API
 * Padroniza o formato de retorno das requisições
 */
export interface ApiResponse<T> {
  /** Dados retornados pela API */
  data: T;
  
  /** Mensagem de sucesso ou informação adicional */
  message: string;
  
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  
  /** Timestamp da resposta */
  timestamp: Date;
}

/**
 * Interface para respostas paginadas da API
 * Utilizada em listagens com paginação
 */
export interface PaginatedResponse<T> {
  /** Dados da página atual */
  data: T[];
  
  /** Página atual (base 1) */
  currentPage: number;
  
  /** Total de páginas disponíveis */
  totalPages: number;
  
  /** Total de itens no banco */
  totalItems: number;
  
  /** Quantidade de itens por página */
  pageSize: number;
  
  /** Indica se há próxima página */
  hasNext: boolean;
  
  /** Indica se há página anterior */
  hasPrevious: boolean;
}

/**
 * Interface para tratamento de erros da API
 */
export interface ApiError {
  /** Código do erro HTTP */
  statusCode: number;
  
  /** Mensagem de erro */
  message: string;
  
  /** Detalhes adicionais do erro */
  details?: string;
  
  /** Timestamp do erro */
  timestamp: Date;
  
  /** Path que gerou o erro */
  path: string;
}