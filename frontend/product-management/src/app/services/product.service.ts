/**
 * Serviço responsável pelo gerenciamento de produtos
 * Implementa operações CRUD e comunicação com a API REST
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { Product, CreateProduct, UpdateProduct } from '../models/product.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

/**
 * Interface para parâmetros de filtro da listagem
 */
export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  search?: string;
}

/**
 * Interface para parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  /** URL base da API - será configurada conforme ambiente */
  private readonly apiUrl = 'http://localhost:5000/api/products';
  
  /** Subject para notificação de mudanças na lista de produtos */
  private productsSubject = new BehaviorSubject<Product[]>([]);
  
  /** Observable público para assinatura de mudanças */
  public products$ = this.productsSubject.asObservable();
  
  /** Subject para controle de loading */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    // Não carrega automaticamente - será carregado pelos componentes quando necessário
  }

  /**
   * Carrega lista de produtos com filtros e paginação
   * @param filters Filtros a serem aplicados
   * @param pagination Parâmetros de paginação
   * @returns Observable com resposta paginada
   */
  getProducts(
    filters?: ProductFilter, 
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<Product>> {
    this.setLoading(true);
    
    let params = new HttpParams();
    
    // Aplica filtros se fornecidos
    filters?.category && (params = params.set('category', filters.category));
    filters?.minPrice && (params = params.set('minPrice', filters.minPrice.toString()));
    filters?.maxPrice && (params = params.set('maxPrice', filters.maxPrice.toString()));
    filters?.active !== undefined && (params = params.set('active', filters.active.toString()));
    filters?.search && (params = params.set('search', filters.search));
    
    // Aplica paginação se fornecida
    pagination?.page && (params = params.set('page', pagination.page.toString()));
    pagination?.pageSize && (params = params.set('pageSize', pagination.pageSize.toString()));

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params })
      .pipe(
        tap((response: PaginatedResponse<Product>) => {
          // Atualiza o BehaviorSubject com os novos dados
          this.productsSubject.next(response.data);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca um produto específico por ID
   * @param id Identificador do produto
   * @returns Observable com o produto encontrado
   */
  getProductById(id: number): Observable<Product> {
    this.setLoading(true);
    
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: ApiResponse<Product>) => response.data),
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  /**
   * Cria um novo produto
   * @param product Dados do produto a ser criado
   * @returns Observable com o produto criado
   */
  createProduct(product: CreateProduct): Observable<Product> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product)
      .pipe(
        map((response: ApiResponse<Product>) => response.data),
        tap((newProduct: Product) => {
          // Adiciona o novo produto à lista local
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([...currentProducts, newProduct]);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza um produto existente
   * @param id Identificador do produto
   * @param product Dados a serem atualizados
   * @returns Observable com o produto atualizado
   */
  updateProduct(id: number, product: UpdateProduct): Observable<Product> {
    this.setLoading(true);
    
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product)
      .pipe(
        map((response: ApiResponse<Product>) => response.data),
        tap((updatedProduct: Product) => {
          // Atualiza o produto na lista local
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex((p: Product) => p.id === id);
          if (index !== -1) {
            currentProducts[index] = updatedProduct;
            this.productsSubject.next([...currentProducts]);
          }
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Remove um produto
   * @param id Identificador do produto a ser removido
   * @returns Observable com confirmação da remoção
   */
  deleteProduct(id: number): Observable<void> {
    this.setLoading(true);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Remove o produto da lista local
          const currentProducts = this.productsSubject.value;
          const filteredProducts = currentProducts.filter((p: Product) => p.id !== id);
          this.productsSubject.next(filteredProducts);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Recarrega a lista de produtos
   * Útil após operações que podem afetar a listagem
   */
  private loadProducts(): void {
    this.getProducts().subscribe({
      next: () => {
        // Lista atualizada via tap operator
      },
      error: (error: Error) => {
        console.error('Erro ao carregar produtos:', error);
        // Em caso de erro, mantém lista vazia
        this.productsSubject.next([]);
      }
    });
  }

  /**
   * Controla o estado de loading
   * @param loading Estado do loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Tratamento centralizado de erros HTTP
   * @param error Erro capturado
   * @returns Observable com erro tratado
   */
  private handleError = (error: any): Observable<never> => {
    this.setLoading(false);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos';
          break;
        case 404:
          errorMessage = 'Produto não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}`;
      }
    }
    
    console.error('Erro na API:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };
}