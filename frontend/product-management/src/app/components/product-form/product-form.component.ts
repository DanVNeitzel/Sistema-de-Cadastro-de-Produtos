/**
 * Componente de formulário para criação e edição de produtos
 * Implementa formulários reativos com validações robustas
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Importações PO-UI
import {
  PoPageModule,
  PoButtonModule,
  PoFieldModule,
  PoLoadingModule,
  PoNotificationModule,
  PoContainerModule,
  PoBreadcrumbModule
} from '@po-ui/ng-components';

import {
  PoNotificationService,
  PoBreadcrumb,
  PoDialogService
} from '@po-ui/ng-components';

// Imports do projeto
import { Product, CreateProduct, UpdateProduct, ProductCategory } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PoPageModule,
    PoButtonModule,
    PoFieldModule,
    PoLoadingModule,
    PoNotificationModule,
    PoContainerModule,
    PoBreadcrumbModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  /** Formulário reativo */
  productForm!: FormGroup;
  
  /** Estado de loading */
  loading = false;
  
  /** Indica se é modo de edição */
  isEditMode = false;
  
  /** ID do produto (em caso de edição) */
  productId?: number;
  
  /** Produto sendo editado */
  currentProduct?: Product;
  
  /** Subject para gerenciar unsubscribe */
  private destroy$ = new Subject<void>();
  
  /** Configuração do breadcrumb */
  breadcrumb: PoBreadcrumb = {
    items: [
      { label: 'Home', link: '/' },
      { label: 'Produtos', link: '/products' },
      { label: 'Novo Produto' } // Será alterado em caso de edição
    ]
  };
  
  /** Opções para campo de categoria */
  readonly categoryOptions = Object.values(ProductCategory).map(category => ({
    label: this.getCategoryLabel(category),
    value: category
  }));

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private poNotification: PoNotificationService,
    private poDialog: PoDialogService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('ProductFormComponent inicializado');
    console.log('Route params:', this.route.snapshot.paramMap.get('id'));
    
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Formata o preço quando o campo perde o foco
   */
  formatPrice(): void {
    const priceControl = this.productForm.get('price');
    if (priceControl?.value !== null && priceControl?.value !== undefined && priceControl?.value !== '') {
      const formattedValue = Number(parseFloat(priceControl.value).toFixed(2));
      priceControl.setValue(formattedValue);
    }
  }

  /**
   * Inicializa o formulário reativo com validações
   */
  private initializeForm(): void {
    this.productForm = this.formBuilder.group({
      name: [
        '', 
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],
      description: [
        '', 
        [
          Validators.maxLength(500)
        ]
      ],
      price: [
        '', 
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(999999.99)
        ]
      ],
      category: [
        '', 
        [
          Validators.required
        ]
      ],
      imageUrl: [
        '', 
        [
          Validators.pattern(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i)
        ]
      ],
      active: [true] // Padrão ativo
    });
  }

  /**
   * Verifica se está em modo de edição baseado na rota
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.breadcrumb.items[2] = { label: 'Editar Produto' };
      this.loadProductForEdit();
    }
  }

  /**
   * Carrega produto para edição
   */
  private loadProductForEdit(): void {
    if (!this.productId) return;
    
    this.loading = true;
    
    this.productService.getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.currentProduct = product;
          this.populateForm(product);
          this.breadcrumb.items[2] = { label: `Editar: ${product.name}` };
          this.loading = false;
        },
        error: (error) => {
          this.poNotification.error('Erro ao carregar produto: ' + error.message);
          this.router.navigate(['/products']);
        }
      });
  }

  /**
   * Popula o formulário com dados do produto
   */
  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: Number(product.price.toFixed(2)), // Garante 2 casas decimais
      category: product.category,
      imageUrl: product.imageUrl || '',
      active: product.active
    });
  }

  /**
   * Salva o produto (criação ou edição)
   */
  saveProduct(): void {
    console.log('=== SAVEPRODUCT CHAMADO ===');
    console.log('saveProduct chamado', {
      isValid: this.productForm.valid,
      formValue: this.productForm.value,
      isEditMode: this.isEditMode
    });

    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      this.poNotification.warning('Por favor, corrija os erros no formulário.');
      console.log('Formulário inválido:', this.productForm.errors);
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
      return;
    }

    this.loading = true;
    
    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  /**
   * Cria novo produto
   */
  private createProduct(): void {
    const productData: CreateProduct = this.buildProductData() as CreateProduct;
    
    console.log('Criando produto:', productData);
    
    this.productService.createProduct(productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          console.log('Produto criado com sucesso:', product);
          this.poNotification.success('Produto criado com sucesso!');
          this.router.navigate(['/products', product.id]);
        },
        error: (error) => {
          console.error('Erro ao criar produto:', error);
          this.poNotification.error('Erro ao criar produto: ' + error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Atualiza produto existente
   */
  private updateProduct(): void {
    if (!this.productId) return;
    
    const productData: UpdateProduct = this.buildProductData() as UpdateProduct;
    
    this.productService.updateProduct(this.productId, productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.poNotification.success('Produto atualizado com sucesso!');
          this.router.navigate(['/products', product.id]);
        },
        error: (error) => {
          this.poNotification.error('Erro ao atualizar produto: ' + error.message);
          this.loading = false;
        }
      });
  }

  /**
   * Constrói objeto com dados do produto baseado no formulário
   */
  private buildProductData(): CreateProduct | UpdateProduct {
    const formValue = this.productForm.value;
    
    return {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || undefined,
      price: +formValue.price,
      category: formValue.category,
      imageUrl: formValue.imageUrl?.trim() || undefined,
      active: !!formValue.active
    };
  }

  /**
   * Marca todos os campos como tocados para exibir validações
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Cancela operação e volta para listagem
   */
  cancel(): void {
    // Se o formulário foi modificado, confirma com o usuário
    if (this.productForm.dirty) {
      this.poDialog.confirm({
        title: 'Cancelar Edição',
        message: 'Existem alterações não salvas.<br><br>Deseja realmente cancelar e descartar as alterações?',
        confirm: () => this.navigateBack(),
        cancel: () => {}
      });
      return;
    }
    
    // Se não há alterações, navega diretamente
    this.navigateBack();
  }

  /**
   * Navega de volta para a página anterior
   */
  private navigateBack(): void {
    if (this.isEditMode && this.currentProduct) {
      this.router.navigate(['/products', this.currentProduct.id]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  /**
   * Retorna mensagem de erro para campo específico
   */
  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    
    // Retorna erro apenas se o campo foi tocado E tem erros
    if (!field?.errors || (!field?.touched && !field?.dirty)) {
      return null;
    }

    const errors = field.errors;
    
    // Mapa de erros com suas mensagens correspondentes
    const errorMessages: Record<string, (error: any) => string> = {
      required: () => 'Campo obrigatório',
      minlength: (err) => `Mínimo ${err.requiredLength} caracteres`,
      maxlength: (err) => `Máximo ${err.requiredLength} caracteres`,
      min: (err) => {
        const minValue = err.min ?? 0.01;
        return `Valor mínimo: R$ ${minValue.toFixed(2).replace('.', ',')}`;
      },
      max: (err) => {
        const maxValue = err.max ?? 999999.99;
        return `Valor máximo: R$ ${maxValue.toFixed(2).replace('.', ',')}`;
      },
      pattern: () => fieldName === 'imageUrl' 
        ? 'URL inválida'
        : 'Formato inválido'
    };

    // Retorna a primeira mensagem de erro encontrada
    const errorKey = Object.keys(errors).find(key => errorMessages[key]);
    return errorKey ? errorMessages[errorKey](errors[errorKey]) : 'Campo inválido';
  }

  /**
   * Retorna título da página baseado no modo
   */
  get pageTitle(): string {
    return this.isEditMode ? 'Editar Produto' : 'Novo Produto';
  }

  /**
   * Retorna subtitle da página
   */
  get pageSubtitle(): string {
    if (this.isEditMode && this.currentProduct) {
      return `Editando: ${this.currentProduct.name}`;
    }
    return 'Preencha os dados do novo produto';
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

  /**
   * Manipula erro de carregamento de imagem
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  /**
   * Manipula carregamento de imagem bem-sucedido
   */
  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'block';
    }
  }
}