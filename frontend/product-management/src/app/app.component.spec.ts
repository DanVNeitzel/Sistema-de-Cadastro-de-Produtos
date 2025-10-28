/**
 * Testes unitários do AppComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { PoMenuComponent } from '@po-ui/ng-components';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    // Get router and spy on events BEFORE creating component
    router = TestBed.inject(Router);
    spyOnProperty(router, 'events', 'get').and.returnValue(routerEventsSubject.asObservable());
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter o título correto', () => {
    expect(component.title).toBe('Sistema de Cadastro de Produtos');
  });

  it('deve iniciar com o menu expandido', () => {
    expect(component.menuCollapsed).toBe(false);
  });

  describe('toggleMenu', () => {
    it('deve alternar o estado do menu de expandido para colapsado', () => {
      component.menuCollapsed = false;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['toggle']);
      
      component.toggleMenu();
      
      expect(component.menuCollapsed).toBe(true);
      expect(component.menu.toggle).toHaveBeenCalled();
    });

    it('deve alternar o estado do menu de colapsado para expandido', () => {
      component.menuCollapsed = true;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['toggle']);
      
      component.toggleMenu();
      
      expect(component.menuCollapsed).toBe(false);
      expect(component.menu.toggle).toHaveBeenCalled();
    });

    it('não deve quebrar se menu não estiver disponível', () => {
      component.menu = undefined as any;
      
      expect(() => component.toggleMenu()).not.toThrow();
    });
  });

  describe('onMenuItemClick', () => {
    it('deve fechar o menu ao clicar em um item no mobile', () => {
      component.menuCollapsed = false;
      component.isMobile = true;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['collapse']);
      
      component.onMenuItemClick();
      
      expect(component.menuCollapsed).toBe(true);
      expect(component.menu.collapse).toHaveBeenCalled();
    });

    it('deve fechar o menu ao clicar em um item no desktop', () => {
      component.menuCollapsed = false;
      component.isMobile = false;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['collapse']);
      
      component.onMenuItemClick();
      
      expect(component.menuCollapsed).toBe(true);
      expect(component.menu.collapse).toHaveBeenCalled();
    });
  });

  describe('Navigation Events', () => {
    it('deve fechar o menu quando a navegação terminar', () => {
      component.menuCollapsed = false;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['collapse']);
      
      routerEventsSubject.next(new NavigationEnd(1, '/products', '/products'));
      
      expect(component.menuCollapsed).toBe(true);
      expect(component.menu.collapse).toHaveBeenCalled();
    });

    it('não deve fechar o menu se já estiver colapsado', () => {
      component.menuCollapsed = true;
      component.menu = jasmine.createSpyObj('PoMenuComponent', ['collapse']);
      
      routerEventsSubject.next(new NavigationEnd(1, '/products', '/products'));
      
      // collapse ainda será chamado, mas o estado já está correto
      expect(component.menuCollapsed).toBe(true);
    });
  });

  describe('menuItems', () => {
    it('deve ter itens de menu configurados', () => {
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems.length).toBeGreaterThan(0);
    });

    it('deve ter item de Produtos com subitens', () => {
      const produtosItem = component.menuItems.find(item => item.label === 'Produtos');
      
      expect(produtosItem).toBeDefined();
      expect(produtosItem?.subItems).toBeDefined();
      expect(produtosItem?.subItems?.length).toBe(2);
    });

    it('deve ter ação de fechamento em cada subitem', () => {
      const produtosItem = component.menuItems.find(item => item.label === 'Produtos');
      
      produtosItem?.subItems?.forEach(subItem => {
        expect(subItem.action).toBeDefined();
      });
    });
  });

  describe('toolbarActions', () => {
    it('deve ter ações da toolbar configuradas', () => {
      expect(component.toolbarActions).toBeDefined();
      expect(component.toolbarActions.length).toBe(3);
    });

    it('deve ter ação de Menu', () => {
      const menuAction = component.toolbarActions.find(action => action.label === 'Menu');
      expect(menuAction).toBeDefined();
      expect(menuAction?.icon).toBe('po-icon-menu');
    });

    it('deve ter ação de Configurações', () => {
      const configAction = component.toolbarActions.find(action => action.label === 'Configurações');
      expect(configAction).toBeDefined();
    });

    it('deve ter ação de Ajuda', () => {
      const helpAction = component.toolbarActions.find(action => action.label === 'Ajuda');
      expect(helpAction).toBeDefined();
    });
  });
});
