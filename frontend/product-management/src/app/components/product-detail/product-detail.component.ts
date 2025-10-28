/**
 * Componente de detalhes do produto
 * Exibe informações completas e permite ações rápidas
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Importações PO-UI
import {
  PoPageModule,
  PoButtonModule,
  PoInfoModule,
  PoLoadingModule,
  PoNotificationModule,
  PoContainerModule,
  PoBreadcrumbModule,
  PoTagModule,
  PoAvatarModule,
  PoIconModule
} from '@po-ui/ng-components';

import {
  PoNotificationService,
  PoBreadcrumb,
  PoTagType,
  PoDialogService
} from '@po-ui/ng-components';

// Imports do projeto
import { Product, ProductCategory } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    PoPageModule,
    PoButtonModule,
    PoInfoModule,
    PoLoadingModule,
    PoNotificationModule,
    PoContainerModule,
    PoBreadcrumbModule,
    PoTagModule,
    PoAvatarModule,
    PoIconModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  /** Produto carregado */
  product?: Product;
  
  /** Estado de loading */
  loading = false;
  
  /** ID do produto */
  productId!: number;
  
  /** Subject para gerenciar unsubscribe */
  private destroy$ = new Subject<void>();
  
  /** Configuração do breadcrumb */
  breadcrumb: PoBreadcrumb = {
    items: [
      { label: 'Home', link: '/' },
      { label: 'Produtos', link: '/products' },
      { label: 'Detalhes do Produto' }
    ]
  };

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private poNotification: PoNotificationService,
    private poDialog: PoDialogService
  ) {}

  ngOnInit(): void {
    this.getProductId();
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtém ID do produto da rota
   */
  private getProductId(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.poNotification.error('ID do produto não encontrado');
      this.router.navigate(['/products']);
      return;
    }
    this.productId = +id;
  }

  /**
   * Carrega dados do produto
   */
  loadProduct(): void {
    this.loading = true;
    
    this.productService.getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.updateBreadcrumb(product.name);
          this.loading = false;
        },
        error: (error) => {
          this.poNotification.error('Erro ao carregar produto: ' + error.message);
          this.router.navigate(['/products']);
        }
      });
  }

  /**
   * Atualiza breadcrumb com nome do produto
   */
  private updateBreadcrumb(productName: string): void {
    this.breadcrumb = {
      items: [
        { label: 'Home', link: '/' },
        { label: 'Produtos', link: '/products' },
        { label: `Detalhes: ${productName}` }
      ]
    };
  }

  /**
   * Navega para edição do produto
   */
  editProduct(): void {
    this.product && this.router.navigate(['/products/edit', this.product.id]);
  }

  /**
   * Confirma exclusão do produto com modal
   */
  confirmDelete(): void {
    if (!this.product) return;
    
    this.poDialog.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o produto <strong>"${this.product.name}"</strong>?<br><br>Esta ação não poderá ser desfeita.`,
      confirm: () => this.deleteProduct(),
      cancel: () => {}
    });
  }

  /**
   * Exclui o produto
   */
  private deleteProduct(): void {
    if (!this.product) return;
    
    this.loading = true;
    
    this.productService.deleteProduct(this.product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.poNotification.success('Produto excluído com sucesso!');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.poNotification.error('Erro ao excluir produto: ' + error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Volta para listagem
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Retorna label amigável para categoria
   */
  getCategoryLabel(category: ProductCategory | string): string {
    const labels: Record<ProductCategory, string> = {
      [ProductCategory.ELETRONICOS]: 'Eletrônicos',
      [ProductCategory.ROUPAS]: 'Roupas',
      [ProductCategory.CASA]: 'Casa e Decoração',
      [ProductCategory.ESPORTES]: 'Esportes',
      [ProductCategory.LIVROS]: 'Livros',
      [ProductCategory.OUTROS]: 'Outros'
    };
    
    return labels[category as ProductCategory] || category as string;
  }

  /**
   * Retorna configuração do status como tag
   */
  getStatusTag(): { value: string; type: PoTagType; icon: string } {
    const statusConfigs = {
      active: { value: 'Ativo', type: PoTagType.Success, icon: 'po-icon-ok' },
      inactive: { value: 'Inativo', type: PoTagType.Danger, icon: 'po-icon-close' },
      unknown: { value: 'Desconhecido', type: PoTagType.Info, icon: 'po-icon-question' }
    };
    
    return this.product?.active 
      ? statusConfigs.active 
      : (this.product ? statusConfigs.inactive : statusConfigs.unknown);
  }

  /**
   * Formata preço para exibição
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Formata data para exibição
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Verifica se há imagem válida
   */
  hasValidImage(): boolean {
    return !!(this.product?.imageUrl && this.product.imageUrl.trim());
  }

  /**
   * Manipula erro de carregamento de imagem
   */
  onImageError(event: any): void {
    event.target.style.display = 'none';
    // Poderia mostrar uma imagem placeholder aqui
  }
}