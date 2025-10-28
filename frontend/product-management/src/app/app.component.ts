/**
 * Componente raiz da aplicação
 * Responsável pela estrutura principal e navegação
 */

import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

// Importações do PO-UI
import { PoMenuModule, PoMenuComponent } from '@po-ui/ng-components';
import { PoPageModule } from '@po-ui/ng-components';
import { PoToolbarModule } from '@po-ui/ng-components';
import { PoMenuItem } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    PoMenuModule,
    PoPageModule,
    PoToolbarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /** Referência ao componente do menu */
  @ViewChild(PoMenuComponent, { static: true }) menu!: PoMenuComponent;

  /** Título da aplicação */
  title = 'Sistema de Cadastro de Produtos';

  /** Estado do menu (colapsado ou expandido) */
  menuCollapsed = false;

  /** Indica se está em modo mobile */
  isMobile = false;

  /** Controla quais submenus estão abertos no mobile */
  private openedSubmenus = new Set<string>();

  constructor(private router: Router) {
    // Escuta mudanças de rota para fechar o menu automaticamente
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
      });
  }

  ngOnInit(): void {
    this.checkMobileMode();
    // Inicia com menu fechado em mobile
    if (this.isMobile) {
      this.menuCollapsed = true;
    }
  }

  /**
   * Detecta mudanças no tamanho da janela
   */
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkMobileMode();
  }

  /**
   * Verifica se está em modo mobile
   */
  private checkMobileMode(): void {
    this.isMobile = window.innerWidth < 769;
    if (this.isMobile && !this.menuCollapsed) {
      this.menuCollapsed = true;
      if (this.menu) {
        this.menu.collapse();
      }
    }
  }

  /** Configuração do menu lateral */
  readonly menuItems: PoMenuItem[] = [
    {
      label: 'Início',
      icon: 'po-icon-home',
      shortLabel: 'Home',
      link: '/',
      action: () => this.onMenuItemClick()
    },
    {
      label: 'Produtos',
      icon: 'po-icon-stock',
      shortLabel: 'Produtos',
      subItems: [
        {
          label: 'Novo Produto',
          link: '/products/new',
          icon: 'po-icon-plus',
          action: () => this.onMenuItemClick()
        },
        {
          label: 'Listar Produtos',
          link: '/products',
          icon: 'po-icon-list',
          action: () => this.onMenuItemClick()
        }
      ]
    }
    // Dashboard será implementado futuramente
    /*
    {
      label: 'Dashboard',
      icon: 'po-icon-chart-columns',
      link: '/dashboard'
    }
    */
  ];

  /** Ações da toolbar */
  readonly toolbarActions = [
    {
      label: 'Menu',
      icon: 'po-icon-menu',
      action: () => this.toggleMenu()
    },
    {
      label: 'Configurações',
      icon: 'po-icon-settings',
      action: () => this.openSettings()
    },
    {
      label: 'Ajuda',
      icon: 'po-icon-question',
      action: () => this.openHelp()
    }
  ];

  /**
   * Alterna entre menu expandido e colapsado
   */
  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
    if (this.menu) {
      this.menu.toggle();
    }
  }

  /**
   * Callback ao clicar em um item do menu
   */
  onMenuItemClick(): void {
    // Fecha o menu imediatamente ao clicar
    this.closeMenu();
  }

  /**
   * Fecha o menu (colapsa) - força o menu a ficar reduzido
   */
  closeMenu(): void {
    this.menuCollapsed = true;
    if (this.menu) {
      this.menu.collapse();
    }
    // Limpa submenus abertos no mobile
    if (this.isMobile) {
      this.openedSubmenus.clear();
    }
  }

  /**
   * Alterna a visibilidade de um submenu no mobile
   */
  toggleSubmenu(item: PoMenuItem): void {
    if (this.openedSubmenus.has(item.label)) {
      this.openedSubmenus.delete(item.label);
    } else {
      this.openedSubmenus.add(item.label);
    }
  }

  /**
   * Verifica se um submenu está aberto
   */
  isSubmenuOpen(item: PoMenuItem): boolean {
    return this.openedSubmenus.has(item.label);
  }

  /**
   * Abre modal de configurações (implementação futura)
   */
  private openSettings(): void {
    console.log('Abrir configurações - implementação futura');
  }

  /**
   * Abre modal de ajuda (implementação futura)
   */
  private openHelp(): void {
    console.log('Abrir ajuda - implementação futura');
  }
}