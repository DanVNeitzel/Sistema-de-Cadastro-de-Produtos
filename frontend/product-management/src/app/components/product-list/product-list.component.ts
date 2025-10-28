/**
 * Componente de listagem de produtos
 * Implementa CRUD com tabela responsiva, filtros e paginação usando PO-UI
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, timeout, catchError, of } from 'rxjs';

// Importações PO-UI
import {
  PoTableModule,
  PoPageModule,
  PoButtonModule,
  PoFieldModule,
  PoLoadingModule,
  PoNotificationModule,
  PoModalModule,
  PoContainerModule
} from '@po-ui/ng-components';

import {
  PoTableColumn,
  PoTableAction,
  PoPageAction,
  PoNotificationService,
  PoTagType,
  PoDialogService
} from '@po-ui/ng-components';

// Imports do projeto
import { Product, ProductCategory } from '../../models/product.model';
import { PaginatedResponse } from '../../models/api-response.model';
import { ProductService, ProductFilter } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PoTableModule,
    PoPageModule,
    PoButtonModule,
    PoFieldModule,
    PoLoadingModule,
    PoNotificationModule,
    PoModalModule,
    PoContainerModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  /** Lista de produtos carregada */
  products: Product[] = [];
  
  /** Estado de loading */
  loading = false;
  
  /** Formulário de filtros */
  filterForm!: FormGroup;
  
  /** Subject para gerenciar unsubscribe */
  private destroy$ = new Subject<void>();
  
  /** Configurações de paginação */
  readonly pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  
  /** Configurações das colunas da tabela */
  readonly columns: PoTableColumn[] = [
    {
      property: 'id',
      label: 'ID',
      type: 'number',
      width: '80px'
    },
    {
      property: 'name',
      label: 'Nome',
      type: 'link',
      action: (value: string, row: Product) => this.viewProduct(row.id)
    },
    {
      property: 'category',
      label: 'Categoria',
      type: 'string'
    },
    {
      property: 'price',
      label: 'Preço',
      type: 'currency',
      format: 'BRL'
    },
    {
      property: 'active',
      label: 'Status',
      type: 'label',
      width: '120px',
      labels: [
        { value: 'true', color: 'color-11', label: 'Ativo', textColor: '#fff' },
        { value: 'false', color: 'color-07', label: 'Inativo', textColor: '#fff' }
      ]
    },
    {
      property: 'updatedAt',
      label: 'Última Atualização',
      type: 'date',
      format: 'dd/MM/yyyy HH:mm'
    }
  ];
  
  /** Ações da tabela para cada linha */
  readonly tableActions: PoTableAction[] = [
    {
      label: 'Visualizar',
      icon: 'po-icon-eye',
      action: (product: Product) => this.viewProduct(product.id)
    },
    {
      label: 'Editar',
      icon: 'po-icon-edit',
      action: this.editProduct.bind(this)
    },
    {
      label: 'Excluir',
      icon: 'po-icon-delete',
      type: 'danger',
      action: this.confirmDelete.bind(this)
    }
  ];
  
  /** Ações da página */
  readonly pageActions: PoPageAction[] = [
    {
      label: 'Novo Produto',
      icon: 'po-icon-plus',
      action: () => this.router.navigate(['/products/new'])
    },
    {
      label: 'Atualizar Lista',
      icon: 'po-icon-refresh',
      action: () => this.loadProducts()
    }
  ];
  
  /** Opções para filtro de categoria */
  readonly categoryOptions = Object.values(ProductCategory).map(category => ({
    label: this.getCategoryLabel(category),
    value: category
  }));

  /** Opções para filtro de status */
  readonly statusOptions = [
    { label: 'Ativos', value: 'true' },
    { label: 'Inativos', value: 'false' }
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private formBuilder: FormBuilder,
    private poNotification: PoNotificationService,
    private poDialog: PoDialogService
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa o formulário de filtros
   */
  private initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      search: [''],
      category: [''],
      minPrice: [null],
      maxPrice: [null],
      active: ['']
    });
  }

  /**
   * Configura subscription para filtros com debounce
   */
  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última alteração
        distinctUntilChanged(), // Só emite se o valor mudou
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset página ao filtrar
        this.loadProducts();
      });
  }

  /**
   * Carrega lista de produtos com filtros aplicados
   */
  loadProducts(): void {
    this.loading = true;
    console.log('Iniciando carregamento de produtos...');
    
    const filters: ProductFilter = this.buildFilters();
    const pagination = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.getProducts(filters, pagination)
      .pipe(
        timeout(5000), // Timeout de 5 segundos
        catchError(error => {
          console.error('Erro ou timeout no carregamento:', error);
          this.loading = false;
          if (error.name === 'TimeoutError') {
            this.poNotification.error('Tempo limite excedido ao carregar produtos');
          } else {
            this.poNotification.error('Erro ao carregar produtos: ' + error.message);
          }
          return of({ data: [], currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          // Mapeia produtos para adicionar propriedade active como string para o label
          this.products = response.data.map(product => ({
            ...product,
            active: product.active.toString() as any
          }));
          this.totalItems = response.totalItems;
          this.loading = false;
          console.log('Produtos carregados:', this.products.length, 'Loading:', this.loading);
        },
        error: (error: Error) => {
          console.error('Erro ao carregar produtos:', error);
          this.poNotification.error('Erro ao carregar produtos: ' + error.message);
          this.loading = false;
        },
        complete: () => {
          // Garantir que o loading seja desativado
          this.loading = false;
          console.log('Carregamento completo. Loading:', this.loading);
        }
      });
  }

  /**
   * Constrói objeto de filtros baseado no formulário
   */
  private buildFilters(): ProductFilter {
    const formValue = this.filterForm.value;
    const filters: ProductFilter = {};
    
    // Log para debug
    console.log('Form values:', formValue);
    console.log('Active value type:', typeof formValue.active, 'Value:', formValue.active);
    
    // Adiciona apenas propriedades válidas ao objeto de filtros
    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }
    
    if (formValue.category) {
      filters.category = formValue.category;
    }
    
    if (formValue.minPrice !== null && formValue.minPrice >= 0) {
      filters.minPrice = formValue.minPrice;
    }
    
    if (formValue.maxPrice !== null && formValue.maxPrice >= 0) {
      filters.maxPrice = formValue.maxPrice;
    }
    
    // Tratamento para active: converte string para boolean
    if (formValue.active !== null && formValue.active !== undefined && formValue.active !== '') {
      filters.active = formValue.active === 'true';
      console.log('Active filter adicionado:', filters.active);
    }
    
    console.log('Filters built:', filters);
    return filters;
  }

  /**
   * Navega para visualização do produto
   */
  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Navega para edição do produto
   */
  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  /**
   * Confirma exclusão do produto com modal
   */
  confirmDelete(product: Product): void {
    this.poDialog.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o produto <strong>"${product.name}"</strong>?<br><br>Esta ação não poderá ser desfeita.`,
      confirm: () => this.deleteProduct(product.id),
      cancel: () => {}
    });
  }

  /**
   * Exclui produto
   */
  private deleteProduct(productId: number): void {
    this.loading = true;
    
    this.productService.deleteProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.poNotification.success('Produto excluído com sucesso!');
          this.loadProducts(); // Recarrega lista
        },
        error: (error: Error) => {
          this.poNotification.error('Erro ao excluir produto: ' + error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      active: ''
    });
  }

  /**
   * Manipula mudança de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  /**
   * Calcula o total de páginas
   */
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  /**
   * Retorna o tipo de tag baseado no status
   */
  getTagType(active: boolean): PoTagType {
    return active ? PoTagType.Success : PoTagType.Danger;
  }

  /**
   * Retorna label amigável para categoria
   */
  private getCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
      [ProductCategory.ELETRONICOS]: 'Eletrônicos',
      [ProductCategory.ROUPAS]: 'Roupas',
      [ProductCategory.CASA]: 'Casa e Decoração',
      [ProductCategory.ESPORTES]: 'Esportes',
      [ProductCategory.LIVROS]: 'Livros',
      [ProductCategory.OUTROS]: 'Outros'
    };
    
    return labels[category] || category;
  }
}