/**
 * Testes de integração para ProductApiService
 * Testa chamadas HTTP reais usando HttpTestingController
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductApiService, ProductFilter } from './product-api.service';
import { Product, ProductCategory } from '../models/product.model';
import { PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  // Mock de produto para testes
  const mockProduct: Product = {
    id: 1,
    name: 'Produto Teste',
    description: 'Descrição do produto teste',
    price: 199.90,
    category: ProductCategory.ELETRONICOS,
    imageUrl: 'https://example.com/image.jpg',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  // Mock de resposta paginada
  const mockPaginatedResponse: PaginatedResponse<Product> = {
    data: [mockProduct],
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductApiService]
    });

    service = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica se não há requisições pendentes
    httpMock.verify();
  });

  describe('Inicialização', () => {
    it('deve ser criado', () => {
      expect(service).toBeTruthy();
    });

    it('deve ter a URL da API configurada corretamente', () => {
      expect(apiUrl).toContain('/products');
    });
  });

  describe('getProducts', () => {
    it('deve buscar produtos com sucesso', () => {
      service.getProducts().subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('Produto Teste');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('deve aplicar filtros aos parâmetros da requisição', () => {
      const filters: ProductFilter = {
        search: 'teste',
        category: ProductCategory.ELETRONICOS,
        minPrice: 100,
        maxPrice: 500,
        active: true
      };

      const pagination = { page: 2, pageSize: 20 };

      service.getProducts(filters, pagination).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === apiUrl && 
        req.params.get('search') === 'teste' &&
        req.params.get('category') === ProductCategory.ELETRONICOS &&
        req.params.get('minPrice') === '100' &&
        req.params.get('maxPrice') === '500' &&
        req.params.get('active') === 'true' &&
        req.params.get('page') === '2' &&
        req.params.get('pageSize') === '20'
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('deve atualizar o BehaviorSubject com os produtos', (done) => {
      service.getProducts().subscribe(() => {
        service.products$.subscribe(products => {
          expect(products).toEqual(mockPaginatedResponse.data);
          expect(products.length).toBe(1);
          done();
        });
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockPaginatedResponse);
    });

    it('deve tratar erro 404', (done) => {
      service.getProducts().subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Recurso não encontrado');
          done();
        }
      });

      // Primeira tentativa
      const req1 = httpMock.expectOne(apiUrl);
      req1.flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Retry 1
      const req2 = httpMock.expectOne(apiUrl);
      req2.flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Retry 2
      const req3 = httpMock.expectOne(apiUrl);
      req3.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('deve tratar erro 500', (done) => {
      service.getProducts().subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Erro interno do servidor');
          done();
        }
      });

      // Primeira tentativa
      const req1 = httpMock.expectOne(apiUrl);
      req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Retry 1
      const req2 = httpMock.expectOne(apiUrl);
      req2.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Retry 2
      const req3 = httpMock.expectOne(apiUrl);
      req3.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProductById', () => {
    it('deve buscar um produto por ID', () => {
      service.getProductById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('deve tratar erro 404 ao buscar produto inexistente', (done) => {
      service.getProductById(999).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Recurso não encontrado');
          done();
        }
      });

      // Primeira tentativa
      const req1 = httpMock.expectOne(`${apiUrl}/999`);
      req1.flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Retry (segunda tentativa)
      const req2 = httpMock.expectOne(`${apiUrl}/999`);
      req2.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createProduct', () => {
    it('deve criar um novo produto', () => {
      const newProduct = { ...mockProduct };
      delete (newProduct as any).id;
      delete (newProduct as any).createdAt;
      delete (newProduct as any).updatedAt;

      service.createProduct(newProduct).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockProduct);
    });

    it('deve atualizar a lista de produtos após criação', (done) => {
      const newProduct = { ...mockProduct };
      delete (newProduct as any).id;
      delete (newProduct as any).createdAt;
      delete (newProduct as any).updatedAt;

      // Primeiro adiciona um produto à lista
      service['productsSubject'].next([]);

      service.createProduct(newProduct).subscribe(() => {
        service.products$.subscribe(products => {
          expect(products.length).toBe(1);
          expect(products[0]).toEqual(mockProduct);
          done();
        });
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockProduct);
    });

    it('deve tratar erro 400 ao criar produto com dados inválidos', () => {
      const invalidProduct = { ...mockProduct };
      delete (invalidProduct as any).id;
      delete (invalidProduct as any).name; // Campo obrigatório

      service.createProduct(invalidProduct as any).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Nome é obrigatório');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Nome é obrigatório' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar um produto existente', () => {
      const updatedData = { name: 'Produto Atualizado', price: 299.90 };
      const updatedProduct = { ...mockProduct, ...updatedData };

      service.updateProduct(1, updatedData).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        expect(product.name).toBe('Produto Atualizado');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(updatedProduct);
    });

    it('deve atualizar o produto na lista após atualização', (done) => {
      // Primeiro adiciona o produto à lista
      service['productsSubject'].next([mockProduct]);

      const updatedData = { name: 'Produto Atualizado' };
      const updatedProduct = { ...mockProduct, ...updatedData };

      service.updateProduct(1, updatedData).subscribe(() => {
        service.products$.subscribe(products => {
          expect(products[0].name).toBe('Produto Atualizado');
          done();
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(updatedProduct);
    });

    it('deve tratar erro 404 ao atualizar produto inexistente', () => {
      service.updateProduct(999, { name: 'Teste' }).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Recurso não encontrado');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteProduct', () => {
    it('deve deletar um produto', () => {
      service.deleteProduct(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('deve remover o produto da lista após deleção', (done) => {
      // Primeiro adiciona o produto à lista
      service['productsSubject'].next([mockProduct]);

      service.deleteProduct(1).subscribe(() => {
        service.products$.subscribe(products => {
          expect(products.length).toBe(0);
          done();
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(null);
    });

    it('deve tratar erro 404 ao deletar produto inexistente', () => {
      service.deleteProduct(999).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Recurso não encontrado');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('clearCache', () => {
    it('deve limpar o cache de produtos', (done) => {
      service['productsSubject'].next([mockProduct]);

      service.clearCache();

      service.products$.subscribe(products => {
        expect(products.length).toBe(0);
        done();
      });
    });
  });

  describe('Comportamento Observable', () => {
    it('products$ deve emitir novos valores quando produtos são carregados', (done) => {
      const emissions: Product[][] = [];

      service.products$.subscribe(products => {
        emissions.push(products);
        
        if (emissions.length === 2) {
          expect(emissions[0]).toEqual([]);
          expect(emissions[1]).toEqual(mockPaginatedResponse.data);
          done();
        }
      });

      service.getProducts().subscribe();
      
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockPaginatedResponse);
    });
  });
});
