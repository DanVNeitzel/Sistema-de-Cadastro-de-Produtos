/**
 * Interface que define a estrutura de um produto no sistema
 * Utilizada para tipagem TypeScript e validações
 */
export interface Product {
  /** Identificador único do produto */
  id: number;
  
  /** Nome do produto - obrigatório */
  name: string;
  
  /** Descrição detalhada do produto - opcional */
  description?: string;
  
  /** Preço do produto em reais - obrigatório */
  price: number;
  
  /** Categoria do produto - obrigatório */
  category: string;
  
  /** URL da imagem do produto - opcional */
  imageUrl?: string;
  
  /** Indica se o produto está ativo/disponível - padrão true */
  active: boolean;
  
  /** Data de criação do produto */
  createdAt: Date;
  
  /** Data da última atualização do produto */
  updatedAt: Date;
}

/**
 * Interface para criação de novos produtos (sem id, createdAt, updatedAt)
 * Utilizada nos formulários de criação
 */
export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  active: boolean;
}

/**
 * Interface para atualização de produtos (campos opcionais)
 * Permite atualizações parciais dos dados
 */
export interface UpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  active?: boolean;
}

/**
 * Enum para categorias de produtos
 * Facilita a padronização e validação das categorias
 */
export enum ProductCategory {
  ELETRONICOS = 'ELETRONICOS',
  ROUPAS = 'ROUPAS',
  CASA = 'CASA',
  ESPORTES = 'ESPORTES',
  LIVROS = 'LIVROS',
  OUTROS = 'OUTROS'
}