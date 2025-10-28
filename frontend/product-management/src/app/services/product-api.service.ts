/**
 * Serviço de produtos com integração API real
 * Realiza chamadas HTTP para o backend .NET
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, retry, timeout } from 'rxjs/operators';

import { Product, ProductCategory } from '../models/product.model';
import { PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

/**
 * Interface para filtros de produtos
 */
export interface ProductFilter {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
}

/**
 * Interface para paginação
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  /** Observable para notificar mudanças em produtos */
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    if (environment.enableDebugMode) {
      console.log('ProductApiService initialized with API URL:', this.apiUrl);
    }
  }

  /**
   * Busca produtos com filtros e paginação
   */
  getProducts(
    filters?: ProductFilter,
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    // Adiciona parâmetros de paginação
    if (pagination) {
      params = params.set('page', pagination.page.toString());
      params = params.set('pageSize', pagination.pageSize.toString());
    }

    // Adiciona filtros aos parâmetros
    if (filters) {
      if (filters.search?.trim()) {
        params = params.set('search', filters.search.trim());
      }
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        params = params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.active !== undefined && filters.active !== null) {
        params = params.set('active', filters.active.toString());
      }
    }

    if (environment.enableDebugMode) {
      console.log('Fetching products with params:', params.toString());
    }

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params })
      .pipe(
        timeout(environment.apiTimeout),
        retry(2), // Retry até 2 vezes em caso de falha
        tap(response => {
          this.productsSubject.next(response.data);
          if (environment.enableDebugMode) {
            console.log('Products fetched successfully:', response.data.length);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca um produto por ID
   */
  getProductById(id: number): Observable<Product> {
    if (environment.enableDebugMode) {
      console.log('Fetching product by ID:', id);
    }

    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(environment.apiTimeout),
        retry(1),
        tap(product => {
          if (environment.enableDebugMode) {
            console.log('Product fetched:', product);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cria um novo produto
   */
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    if (environment.enableDebugMode) {
      console.log('Creating product:', product);
    }

    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        timeout(environment.apiTimeout),
        tap(newProduct => {
          // Atualiza a lista de produtos
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([...currentProducts, newProduct]);

          if (environment.enableDebugMode) {
            console.log('Product created successfully:', newProduct);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza um produto existente
   */
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    if (environment.enableDebugMode) {
      console.log('Updating product:', id, product);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(
        timeout(environment.apiTimeout),
        tap(updatedProduct => {
          // Atualiza a lista de produtos
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex(p => p.id === id);
          if (index !== -1) {
            currentProducts[index] = updatedProduct;
            this.productsSubject.next([...currentProducts]);
          }

          if (environment.enableDebugMode) {
            console.log('Product updated successfully:', updatedProduct);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Deleta um produto
   */
  deleteProduct(id: number): Observable<void> {
    if (environment.enableDebugMode) {
      console.log('Deleting product:', id);
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(environment.apiTimeout),
        tap(() => {
          // Remove da lista de produtos
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next(currentProducts.filter(p => p.id !== id));

          if (environment.enableDebugMode) {
            console.log('Product deleted successfully');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento centralizado de erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      // Erro retornado pelo backend
      switch (error.status) {
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Dados inválidos. Verifique as informações.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 409:
          errorMessage = 'Conflito. O recurso já existe.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Dados inválidos para processamento.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        case 503:
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    if (environment.enableDebugMode) {
      console.error('API Error:', error);
      console.error('Error message:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Limpa o cache de produtos
   */
  clearCache(): void {
    this.productsSubject.next([]);
  }
}
