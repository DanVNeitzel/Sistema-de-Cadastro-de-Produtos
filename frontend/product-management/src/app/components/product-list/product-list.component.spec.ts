/**
 * Testes unitários do ProductListComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, Observable } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { PoNotificationService, PoDialogService } from '@po-ui/ng-components';
import { Product, ProductCategory } from '../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotification: jasmine.SpyObj<PoNotificationService>;
  let mockDialog: jasmine.SpyObj<PoDialogService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Produto Teste 1',
      description: 'Descrição teste',
      price: 100,
      category: ProductCategory.ELETRONICOS,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Produto Teste 2',
      description: 'Descrição teste 2',
      price: 200,
      category: ProductCategory.ROUPAS,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotification = jasmine.createSpyObj('PoNotificationService', ['success', 'error']);
    mockDialog = jasmine.createSpyObj('PoDialogService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
        { provide: PoNotificationService, useValue: mockNotification },
        { provide: PoDialogService, useValue: mockDialog }
      ]
    })
    .overrideComponent(ProductListComponent, {
      set: {
        providers: [
          { provide: PoDialogService, useValue: mockDialog }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar produtos na inicialização', () => {
      mockProductService.getProducts.and.returnValue(of({
        data: mockProducts,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      }));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(mockProductService.getProducts).toHaveBeenCalled();
      expect(component.products.length).toBe(2);
      expect(component.totalItems).toBe(2);
    });
  });

  describe('loadProducts', () => {
    it('deve carregar produtos com sucesso', (done) => {
      mockProductService.getProducts.and.returnValue(of({
        data: mockProducts,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      }));

      component.loadProducts();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(component.products.length).toBe(2);
        expect(component.totalItems).toBe(2);
        done();
      }, 100);
    });

    it('deve mostrar erro ao falhar no carregamento', (done) => {
      mockProductService.getProducts.and.returnValue(
        throwError(() => new Error('Erro de teste'))
      );

      component.loadProducts();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(mockNotification.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('deve ativar loading durante carregamento', () => {
      // Create a delayed observable to keep loading true during the check
      let resolveObservable: any;
      const delayedObservable = new Promise<any>(resolve => {
        resolveObservable = resolve;
      });
      
      mockProductService.getProducts.and.returnValue(
        new Observable(subscriber => {
          delayedObservable.then(value => {
            subscriber.next(value);
            subscriber.complete();
          });
        })
      );

      component.loading = false;
      component.loadProducts();

      // Should be true immediately after calling loadProducts
      expect(component.loading).toBe(true);
      
      // Resolve the observable
      resolveObservable({
        data: [],
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      });
    });
  });

  describe('viewProduct', () => {
    it('deve navegar para detalhes do produto', () => {
      component.viewProduct(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 1]);
    });
  });

  describe('editProduct', () => {
    it('deve navegar para edição do produto', () => {
      component.editProduct(mockProducts[0]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/edit', 1]);
    });
  });

  describe('confirmDelete', () => {
    beforeEach(() => {
      // Mock getProducts
      mockProductService.getProducts.and.returnValue(of({
        data: mockProducts,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      }));
      
      // Initialize component
      fixture.detectChanges();
    });

    it('deve abrir dialog de confirmação', () => {
      // Call the method
      component.confirmDelete(mockProducts[0]);
      
      // Verify the spy was called
      expect(mockDialog.confirm).toHaveBeenCalled();
    });

    it('deve passar mensagem correta para o dialog', () => {
      // Call the method
      component.confirmDelete(mockProducts[0]);
      
      // Verify the spy was called
      expect(mockDialog.confirm).toHaveBeenCalled();
      
      // Verify the call arguments
      const callArgs = mockDialog.confirm.calls.mostRecent().args[0];
      expect(callArgs.title).toBe('Confirmar Exclusão');
      expect(callArgs.message).toContain('Produto Teste 1');
    });
  });

  describe('deleteProduct', () => {
    beforeEach(() => {
      mockProductService.getProducts.and.returnValue(of({
        data: mockProducts,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      }));
    });

    it('deve excluir produto com sucesso', (done) => {
      mockProductService.deleteProduct.and.returnValue(of(void 0));
      
      // Acessa método privado através de any
      (component as any).deleteProduct(1);

      setTimeout(() => {
        expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
        expect(mockNotification.success).toHaveBeenCalledWith('Produto excluído com sucesso!');
        done();
      }, 100);
    });

    it('deve mostrar erro ao falhar na exclusão', (done) => {
      mockProductService.deleteProduct.and.returnValue(
        throwError(() => new Error('Erro ao excluir'))
      );
      
      (component as any).deleteProduct(1);

      setTimeout(() => {
        expect(mockNotification.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('clearFilters', () => {
    it('deve limpar o formulário de filtros', () => {
      component.filterForm.patchValue({
        search: 'teste',
        category: ProductCategory.ELETRONICOS,
        minPrice: 100,
        maxPrice: 500,
        active: 'true'
      });

      component.clearFilters();

      expect(component.filterForm.value.search).toBe('');
      expect(component.filterForm.value.category).toBe('');
      expect(component.filterForm.value.minPrice).toBeNull();
      expect(component.filterForm.value.maxPrice).toBeNull();
      expect(component.filterForm.value.active).toBe('');
    });
  });

  describe('onPageChange', () => {
    it('deve atualizar página atual e recarregar produtos', () => {
      mockProductService.getProducts.and.returnValue(of({
        data: mockProducts,
        currentPage: 2,
        pageSize: 10,
        totalItems: 20,
        totalPages: 2,
        hasNext: false,
        hasPrevious: true
      }));

      component.onPageChange(2);

      expect(component.currentPage).toBe(2);
      expect(mockProductService.getProducts).toHaveBeenCalled();
    });
  });

  describe('getTotalPages', () => {
    it('deve calcular total de páginas corretamente', () => {
      component.totalItems = 25;
      expect(component.getTotalPages()).toBe(3);
    });

    it('deve retornar 1 quando não há itens', () => {
      component.totalItems = 0;
      expect(component.getTotalPages()).toBe(1);
    });
  });

  describe('columns', () => {
    it('deve ter colunas configuradas', () => {
      expect(component.columns).toBeDefined();
      expect(component.columns.length).toBeGreaterThan(0);
    });

    it('deve ter coluna de nome com action', () => {
      const nomeColumn = component.columns.find(col => col.property === 'name');
      expect(nomeColumn).toBeDefined();
      expect(nomeColumn?.type).toBe('link');
      expect(nomeColumn?.action).toBeDefined();
    });
  });

  describe('tableActions', () => {
    it('deve ter ações da tabela configuradas', () => {
      expect(component.tableActions).toBeDefined();
      expect(component.tableActions.length).toBe(3);
    });

    it('deve ter ação de exclusão com tipo danger', () => {
      const deleteAction = component.tableActions.find(action => action.label === 'Excluir');
      expect(deleteAction).toBeDefined();
      expect(deleteAction?.type).toBe('danger');
    });
  });
});
