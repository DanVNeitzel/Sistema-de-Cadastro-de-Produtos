/**
 * Testes unitários do ProductFormComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { PoNotificationService } from '@po-ui/ng-components';
import { Product, ProductCategory } from '../../models/product.model';

describe('ProductFormComponent', () => {
    let component: ProductFormComponent;
    let fixture: ComponentFixture<ProductFormComponent>;
    let mockProductService: jasmine.SpyObj<ProductService>;
    let mockRouter: Router;
    let mockActivatedRoute: any;
    let mockNotification: jasmine.SpyObj<PoNotificationService>;

    const mockProduct: Product = {
        id: 1,
        name: 'Produto Teste',
        description: 'Descrição teste',
        price: 100,
        category: ProductCategory.ELETRONICOS,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(async () => {
        mockProductService = jasmine.createSpyObj('ProductService', [
            'getProductById',
            'createProduct',
            'updateProduct'
        ]);
        mockNotification = jasmine.createSpyObj('PoNotificationService', ['success', 'error', 'warning']);
        mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(null)
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [
                ProductFormComponent,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            providers: [
                { provide: ProductService, useValue: mockProductService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: PoNotificationService, useValue: mockNotification }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        mockRouter = TestBed.inject(Router);
        spyOn(mockRouter, 'navigate');
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit - Modo Criação', () => {
        it('deve inicializar formulário vazio para novo produto', () => {
            fixture.detectChanges();

            expect(component.isEditMode).toBe(false);
            expect(component.productForm.get('name')?.value).toBe('');
            expect(component.productForm.get('price')?.value).toBe('');
        });
    });

    describe('ngOnInit - Modo Edição', () => {
        beforeEach(() => {
            mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
            mockProductService.getProductById.and.returnValue(of(mockProduct));
        });

        it('deve carregar produto para edição', (done) => {
            fixture.detectChanges();

            setTimeout(() => {
                expect(component.isEditMode).toBe(true);
                expect(component.productId).toBe(1);
                expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
                done();
            }, 100);
        });

        it('deve preencher formulário com dados do produto', (done) => {
            fixture.detectChanges();

            setTimeout(() => {
                expect(component.productForm.get('name')?.value).toBe('Produto Teste');
                expect(component.productForm.get('price')?.value).toBe(100);
                expect(component.productForm.get('category')?.value).toBe(ProductCategory.ELETRONICOS);
                done();
            }, 100);
        });
    });

    describe('Validações do Formulário', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('formulário deve ser inválido quando vazio', () => {
            expect(component.productForm.valid).toBe(false);
        });

        it('campo name deve ser obrigatório', () => {
            const nameControl = component.productForm.get('name');
            expect(nameControl?.hasError('required')).toBe(true);
        });

        it('campo price deve ser obrigatório', () => {
            const priceControl = component.productForm.get('price');
            expect(priceControl?.hasError('required')).toBe(true);
        });

        it('campo price deve ser maior que zero', () => {
            const priceControl = component.productForm.get('price');
            priceControl?.setValue(-10);
            expect(priceControl?.hasError('min')).toBe(true);
        });

        it('campo category deve ser obrigatório', () => {
            const categoryControl = component.productForm.get('category');
            expect(categoryControl?.hasError('required')).toBe(true);
        });

        it('formulário deve ser válido com dados corretos', () => {
            component.productForm.patchValue({
                name: 'Produto Teste',
                price: 100,
                category: ProductCategory.ELETRONICOS,
                active: true
            });

            expect(component.productForm.valid).toBe(true);
        });
    });

    describe('saveProduct - Criação', () => {
        beforeEach(() => {
            fixture.detectChanges();
            component.productForm.patchValue({
                name: 'Novo Produto',
                price: 150,
                category: ProductCategory.ELETRONICOS,
                description: 'Nova descrição',
                active: true
            });
        });

        it('deve criar produto com sucesso', (done) => {
            mockProductService.createProduct.and.returnValue(of(mockProduct));

            component.saveProduct();

            setTimeout(() => {
                expect(mockProductService.createProduct).toHaveBeenCalled();
                expect(mockNotification.success).toHaveBeenCalledWith('Produto criado com sucesso!');
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('deve mostrar erro ao falhar na criação', (done) => {
            mockProductService.createProduct.and.returnValue(
                throwError(() => new Error('Erro ao criar'))
            );

            component.saveProduct();

            setTimeout(() => {
                expect(mockNotification.error).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('não deve salvar com formulário inválido', () => {
            component.productForm.patchValue({ name: '' });

            component.saveProduct();

            expect(mockNotification.warning).toHaveBeenCalledWith('Por favor, corrija os erros no formulário.');
            expect(mockProductService.createProduct).not.toHaveBeenCalled();
        });
    });

    describe('saveProduct - Edição', () => {
        beforeEach(() => {
            mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
            mockProductService.getProductById.and.returnValue(of(mockProduct));
            fixture.detectChanges();
        });

        it('deve atualizar produto com sucesso', (done) => {
            mockProductService.updateProduct.and.returnValue(of(mockProduct));

            setTimeout(() => {
                component.productForm.patchValue({ name: 'Produto Atualizado' });
                component.saveProduct();

                setTimeout(() => {
                    expect(mockProductService.updateProduct).toHaveBeenCalled();
                    expect(mockNotification.success).toHaveBeenCalledWith('Produto atualizado com sucesso!');
                    done();
                }, 100);
            }, 100);
        });
    });

    describe('cancel', () => {
        it('deve navegar para lista de produtos', () => {
            component.cancel();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
        });
    });

    describe('categoryOptions', () => {
        it('deve ter opções de categorias configuradas', () => {
            expect(component.categoryOptions).toBeDefined();
            expect(component.categoryOptions.length).toBeGreaterThan(0);
        });

        it('cada opção deve ter label e value', () => {
            component.categoryOptions.forEach(option => {
                expect(option.label).toBeDefined();
                expect(option.value).toBeDefined();
            });
        });
    });
});
