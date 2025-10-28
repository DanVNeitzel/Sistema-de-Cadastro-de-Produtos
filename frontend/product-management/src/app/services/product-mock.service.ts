/**
 * Serviço Mock para simular API REST ASP.NET Core
 * 
 * Simula o comportamento de uma API .NET com:
 * - Respostas padronizadas (ApiResponse<T>)
 * - Códigos de status HTTP apropriados
 * - Mensagens de erro estruturadas
 * - Timestamps no formato ISO 8601
 * - Paginação server-side
 * - Validações de negócio
 * 
 * @see https://docs.microsoft.com/aspnet/core/web-api
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { Product, CreateProduct, UpdateProduct } from '../models/product.model';
import { ApiResponse, PaginatedResponse, ApiError } from '../models/api-response.model';
import { ProductFilter, PaginationParams } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductMockService {
  /** 
   * Base de dados em memória (simula Entity Framework InMemory Database)
   * Em uma API .NET real, isto seria gerenciado pelo EF Core
   */
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Notebook Dell Inspiron 15',
      description: 'Notebook com processador Intel Core i5, 8GB RAM, 256GB SSD',
      price: 3499.90,
      category: 'ELETRONICOS',
      active: true,
      imageUrl: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/inspiron-notebooks/15-3520/pdp/laptop-inspiron-15-3520-pdp-gallery-504x350-bk.psd?fmt=png-alpha&wid=570&hei=400',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-10-20T14:45:00Z')
    },
    {
      id: 2,
      name: 'Mouse Logitech MX Master 3',
      description: 'Mouse sem fio ergonômico com sensor de alta precisão',
      price: 449.90,
      category: 'ELETRONICOS',
      active: true,
      imageUrl: 'https://m.media-amazon.com/images/I/61+OT7FPABL.jpg',
      createdAt: new Date('2024-02-10T09:15:00Z'),
      updatedAt: new Date('2024-10-18T16:20:00Z')
    },
    {
      id: 3,
      name: 'Teclado Mecânico Keychron K2',
      description: 'Teclado mecânico sem fio com switches Red, RGB',
      price: 659.90,
      category: 'ELETRONICOS',
      active: true,
      imageUrl: 'https://carrefourbr.vtexassets.com/arquivos/ids/198365397/image-0.jpg',
      createdAt: new Date('2024-03-05T11:00:00Z'),
      updatedAt: new Date('2024-10-15T13:30:00Z')
    },
    {
      id: 4,
      name: 'Monitor LG UltraWide 29"',
      description: 'Monitor IPS 29 polegadas, resolução 2560x1080, 75Hz',
      price: 1299.90,
      category: 'ELETRONICOS',
      active: true,
      imageUrl: 'https://m.media-amazon.com/images/I/51mHapX90SL._AC_UF894,1000_QL80_.jpg',
      createdAt: new Date('2024-04-12T08:45:00Z'),
      updatedAt: new Date('2024-10-10T10:15:00Z')
    },
    {
      id: 5,
      name: 'Camiseta Nike Dry-Fit',
      description: 'Camiseta esportiva com tecnologia de secagem rápida',
      price: 129.90,
      category: 'ROUPAS',
      active: true,
      imageUrl: 'https://cdn.awsli.com.br/2500x2500/1714/1714539/produto/301464319/e557ac303ce1294613d160a2305c4a7e-badvelksjs.jpeg',
      createdAt: new Date('2024-05-20T15:30:00Z'),
      updatedAt: new Date('2024-10-05T17:00:00Z')
    },
    {
      id: 6,
      name: 'Livro: Clean Code',
      description: 'Guia essencial sobre boas práticas de programação por Robert C. Martin',
      price: 89.90,
      category: 'LIVROS',
      active: true,
      imageUrl: 'https://media.licdn.com/dms/image/v2/C4D12AQElMcNEch38WQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1645152091261?e=2147483647&v=beta&t=rHdnB7tb0gw7fc-RNB1gFelNo8sdOXdg-bx0Cu0WHnk',
      createdAt: new Date('2024-06-08T12:00:00Z'),
      updatedAt: new Date('2024-09-30T09:30:00Z')
    },
    {
      id: 7,
      name: 'Sofá Retrátil 3 Lugares',
      description: 'Sofá confortável com tecido suede, cor cinza',
      price: 2499.90,
      category: 'CASA',
      active: true,
      imageUrl: 'https://www.camainbox.com.br/media/catalog/product/cache/0a0c65509d6052414e566f979b0217be/1/_/1_sofa_retratil_reclinavel_big_fresh_ambiente_azul_6.jpg',
      createdAt: new Date('2024-07-15T14:20:00Z'),
      updatedAt: new Date('2024-09-25T11:45:00Z')
    },
    {
      id: 8,
      name: 'Bola de Futebol Adidas',
      description: 'Bola oficial para campo, tamanho padrão',
      price: 199.90,
      category: 'ESPORTES',
      active: false,
      imageUrl: 'https://images.tcdn.com.br/img/img_prod/734952/bola_adidas_starlancer_unissex_vermelho_e_preto_9431_1_aa90e7bcd7ea97320c54071d8cffec5a.jpeg',
      createdAt: new Date('2024-08-01T10:00:00Z'),
      updatedAt: new Date('2024-09-20T16:30:00Z')
    }
  ];

  /** Subject para notificação de mudanças (simula SignalR) */
  private productsSubject = new BehaviorSubject<Product[]>(this.mockProducts);
  public products$ = this.productsSubject.asObservable();

  /** Subject para controle de loading */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /** 
   * Contador para IDs (simula Identity ou Sequence do SQL Server)
   * Em .NET real: [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
   */
  private nextId = 9;

  /** 
   * Delay para simular latência de rede/processamento
   * Produção: 150-500ms (rede local/otimizada)
   * Desenvolvimento: 300ms (balanceado)
   */
  private readonly API_DELAY = 300;

  constructor() {
    console.warn('� [MOCK] ProductMockService ativo - Simulando ASP.NET Core API');
    console.info('📊 Produtos em memória:', this.mockProducts.length);
  }

  /**
   * GET: api/products
   * Busca produtos com filtros e paginação (Query Parameters)
   * 
   * Simula comportamento do ASP.NET Core:
   * - [FromQuery] para parâmetros
   * - IQueryable<Product> com Where/Skip/Take
   * - ActionResult<PaginatedResponse<Product>>
   * 
   * @param filters Filtros de busca (category, price range, active, search)
   * @param pagination Parâmetros de paginação (page, pageSize)
   * @returns Observable com resposta paginada
   */
  getProducts(
    filters?: ProductFilter,
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<Product>> {
    this.setLoading(true);
    console.log('🔷 [MOCK GET] /api/products', { filters, pagination });

    // Validação (simula ModelState validation do .NET)
    if (!this.mockProducts || !Array.isArray(this.mockProducts)) {
      return this.throwApiError(500, 'Internal Server Error', 'Database context is null');
    }

    return of(this.mockProducts).pipe(
      delay(this.API_DELAY),
      map(products => {
        // Simula LINQ Query: var query = _context.Products.AsQueryable();
        let filtered = [...products];

        // Log para debug
        console.log('Filters recebidos no serviço:', filters);

        // Aplica filtros (simula Where clauses) - array de funções de filtro
        const filterFunctions: Array<(products: Product[]) => Product[]> = [];

        if (filters?.category) {
          filterFunctions.push(prods => prods.filter(p => p.category === filters.category));
        }
        if (filters?.minPrice !== undefined) {
          filterFunctions.push(prods => prods.filter(p => p.price >= filters.minPrice!));
        }
        if (filters?.maxPrice !== undefined) {
          filterFunctions.push(prods => prods.filter(p => p.price <= filters.maxPrice!));
        }
        if (filters?.active !== undefined) {
          console.log('Filtrando por active:', filters.active, 'Tipo:', typeof filters.active);
          filterFunctions.push(prods => prods.filter(p => {
            console.log(`Produto ${p.name}: active=${p.active}, filtro=${filters.active}, match=${p.active === filters.active}`);
            return p.active === filters.active;
          }));
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filterFunctions.push(prods => prods.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
          ));
        }

        // Aplica todos os filtros em sequência
        filtered = filterFunctions.reduce((prods, filterFn) => filterFn(prods), filtered);

        // Paginação (simula Skip/Take do LINQ)
        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 10;
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        
        // Validação de página
        if (page < 1) {
          throw new Error('Page must be greater than 0');
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        // Monta resposta (simula DTO mapping com AutoMapper)
        const response: PaginatedResponse<Product> = {
          data: paginatedData,
          currentPage: page,
          pageSize,
          totalItems,
          totalPages,
          hasNext: endIndex < totalItems,
          hasPrevious: page > 1
        };

        this.productsSubject.next(paginatedData);
        this.setLoading(false);
        
        console.log('✅ [MOCK 200 OK]', {
          returned: paginatedData.length,
          total: totalItems,
          page: `${page}/${totalPages}`
        });
        
        return response;
      })
    );
  }

  /**
   * GET: api/products/{id}
   * Busca produto específico por ID
   * 
   * Simula: [HttpGet("{id}")]
   * public async Task<ActionResult<Product>> GetProduct(int id)
   * 
   * @param id ID do produto
   * @returns Observable com o produto ou erro 404
   */
  getProductById(id: number): Observable<Product> {
    this.setLoading(true);
    console.log(`🔷 [MOCK GET] /api/products/${id}`);

    // Validação
    if (!this.mockProducts || !Array.isArray(this.mockProducts)) {
      return this.throwApiError(500, 'Internal Server Error', 'Database context is null');
    }

    if (!id || id < 1) {
      return this.throwApiError(400, 'Bad Request', 'Invalid product ID');
    }

    // Simula: var product = await _context.Products.FindAsync(id);
    const product = this.mockProducts.find(p => p.id === id);
    
    return of(product).pipe(
      delay(this.API_DELAY),
      tap(() => this.setLoading(false)),
      map(prod => {
        if (!prod) {
          // Simula: return NotFound();
          throw this.createApiError(404, 'Not Found', `Product with ID ${id} not found`);
        }
        console.log('✅ [MOCK 200 OK]', prod);
        return prod;
      })
    );
  }

  /**
   * POST: api/products
   * Cria novo produto
   * 
   * Simula: [HttpPost]
   * public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductDto dto)
   * 
   * @param productData Dados do novo produto
   * @returns Observable com o produto criado
   */
  createProduct(productData: CreateProduct): Observable<Product> {
    this.setLoading(true);
    console.log('🔷 [MOCK POST] /api/products', productData);

    // Validações (simula FluentValidation ou Data Annotations)
    const validationErrors = this.validateProductData(productData);
    if (validationErrors.length > 0) {
      return this.throwApiError(400, 'Validation Failed', validationErrors.join('; '));
    }

    // Cria entidade (simula Entity + AutoMapper)
    const newProduct: Product = {
      id: this.nextId++,
      ...productData,
      active: productData.active !== undefined ? productData.active : true,
      createdAt: new Date(), // Simula: CreatedAt = DateTime.UtcNow
      updatedAt: new Date()  // Simula: UpdatedAt = DateTime.UtcNow
    };

    return of(newProduct).pipe(
      delay(this.API_DELAY),
      tap(() => {
        // Simula: _context.Products.Add(product); await _context.SaveChangesAsync();
        this.mockProducts.push(newProduct);
        this.productsSubject.next([...this.mockProducts]);
        this.setLoading(false);
      }),
      map(product => {
        // Simula: return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        console.log('✅ [MOCK 201 Created]', product);
        return product;
      })
    );
  }

  /**
   * PUT: api/products/{id}
   * Atualiza produto existente
   * 
   * Simula: [HttpPut("{id}")]
   * public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
   * 
   * @param id ID do produto a atualizar
   * @param productData Dados atualizados
   * @returns Observable com o produto atualizado
   */
  updateProduct(id: number, productData: UpdateProduct): Observable<Product> {
    this.setLoading(true);
    console.log(`🔷 [MOCK PUT] /api/products/${id}`, productData);

    // Validações
    if (!this.mockProducts || !Array.isArray(this.mockProducts)) {
      return this.throwApiError(500, 'Internal Server Error', 'Database context is null');
    }

    if (!id || id < 1) {
      return this.throwApiError(400, 'Bad Request', 'Invalid product ID');
    }

    const validationErrors = this.validateProductData(productData, true);
    if (validationErrors.length > 0) {
      return this.throwApiError(400, 'Validation Failed', validationErrors.join('; '));
    }

    // Busca produto (simula: var product = await _context.Products.FindAsync(id);)
    const index = this.mockProducts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return this.throwApiError(404, 'Not Found', `Product with ID ${id} not found`);
    }

    // Atualiza entidade (simula: _mapper.Map(dto, product); _context.Entry(product).State = EntityState.Modified;)
    const updatedProduct: Product = {
      ...this.mockProducts[index],
      ...productData,
      id, // Garante que ID não muda
      createdAt: this.mockProducts[index].createdAt, // Preserva data de criação
      updatedAt: new Date() // Simula: UpdatedAt = DateTime.UtcNow
    };

    return of(updatedProduct).pipe(
      delay(this.API_DELAY),
      tap(() => {
        // Simula: await _context.SaveChangesAsync();
        this.mockProducts[index] = updatedProduct;
        this.productsSubject.next([...this.mockProducts]);
        this.setLoading(false);
      }),
      map(product => {
        console.log('✅ [MOCK 200 OK]', product);
        return product;
      })
    );
  }

  /**
   * DELETE: api/products/{id}
   * Remove produto
   * 
   * Simula: [HttpDelete("{id}")]
   * public async Task<IActionResult> DeleteProduct(int id)
   * 
   * @param id ID do produto a remover
   * @returns Observable void em caso de sucesso
   */
  deleteProduct(id: number): Observable<void> {
    this.setLoading(true);
    console.log(`🔷 [MOCK DELETE] /api/products/${id}`);

    // Validações
    if (!this.mockProducts || !Array.isArray(this.mockProducts)) {
      return this.throwApiError(500, 'Internal Server Error', 'Database context is null');
    }

    if (!id || id < 1) {
      return this.throwApiError(400, 'Bad Request', 'Invalid product ID');
    }

    // Busca produto
    const index = this.mockProducts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return this.throwApiError(404, 'Not Found', `Product with ID ${id} not found`);
    }

    return of(void 0).pipe(
      delay(this.API_DELAY),
      tap(() => {
        // Simula: _context.Products.Remove(product); await _context.SaveChangesAsync();
        this.mockProducts.splice(index, 1);
        this.productsSubject.next([...this.mockProducts]);
        this.setLoading(false);
        
        // Simula: return NoContent(); (204)
        console.log('✅ [MOCK 204 No Content]');
      })
    );
  }

  // ==================== Métodos Privados (Helpers) ====================

  /**
   * Valida dados do produto (simula FluentValidation)
   * 
   * Em .NET seria:
   * public class CreateProductValidator : AbstractValidator<CreateProductDto>
   */
  private validateProductData(data: CreateProduct | UpdateProduct, isUpdate = false): string[] {
    const errors: string[] = [];

    // Validações de nome
    const shouldValidateName = !isUpdate || data.name !== undefined;
    if (shouldValidateName) {
      const nameErrors = {
        empty: 'Name is required',
        tooShort: 'Name must be at least 3 characters',
        tooLong: 'Name must not exceed 200 characters'
      } as const;

      if (!data.name || data.name.trim().length === 0) {
        errors.push(nameErrors['empty']);
      } else if (data.name.length < 3) {
        errors.push(nameErrors['tooShort']);
      } else if (data.name.length > 200) {
        errors.push(nameErrors['tooLong']);
      }
    }

    // Validações de preço
    const shouldValidatePrice = !isUpdate || data.price !== undefined;
    if (shouldValidatePrice) {
      const priceErrors = {
        required: 'Price is required',
        negative: 'Price must be greater than or equal to 0',
        tooHigh: 'Price must not exceed 999999.99'
      } as const;

      if (data.price === undefined || data.price === null) {
        errors.push(priceErrors['required']);
      } else if (data.price < 0) {
        errors.push(priceErrors['negative']);
      } else if (data.price > 999999.99) {
        errors.push(priceErrors['tooHigh']);
      }
    }

    // Validações de categoria
    const shouldValidateCategory = !isUpdate || data.category !== undefined;
    if (shouldValidateCategory) {
      const validCategories = ['ELETRONICOS', 'ROUPAS', 'LIVROS', 'CASA', 'ESPORTES', 'OUTROS'];
      if (!data.category) {
        errors.push('Category is required');
      } else if (!validCategories.includes(data.category)) {
        errors.push(`Category must be one of: ${validCategories.join(', ')}`);
      }
    }

    // Validação de descrição
    data.description && data.description.length > 1000 && 
      errors.push('Description must not exceed 1000 characters');

    return errors;
  }

  /**
   * Cria erro estruturado no formato ASP.NET Core ProblemDetails
   */
  private createApiError(statusCode: number, message: string, details?: string): ApiError {
    return {
      statusCode,
      message,
      details,
      timestamp: new Date(),
      path: '/api/products'
    };
  }

  /**
   * Lança erro observable (simula throw new HttpException())
   */
  private throwApiError(statusCode: number, message: string, details?: string): Observable<never> {
    this.setLoading(false);
    const error = this.createApiError(statusCode, message, details);
    console.error(`❌ [MOCK ${statusCode}]`, error);
    return throwError(() => error);
  }

  /**
   * Controla estado de loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
}
