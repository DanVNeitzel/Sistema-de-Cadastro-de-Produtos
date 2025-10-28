import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PoPageModule, PoContainerModule, PoWidgetModule, PoDividerModule, PoIconModule } from '@po-ui/ng-components';

interface CardOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PoPageModule,
    PoContainerModule,
    PoWidgetModule,
    PoDividerModule,
    PoIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  /** Cards com opções do menu */
  cards: CardOption[] = [
    {
      title: 'Gerenciar Produtos',
      description: 'Visualize, adicione, edite e exclua produtos do catálogo',
      icon: 'po-icon-stock',
      route: '/products',
      color: 'primary'
    },
    {
      title: 'Novo Produto',
      description: 'Cadastre um novo produto no sistema rapidamente',
      icon: 'po-icon-plus-circle',
      route: '/products/new',
      color: 'success'
    }
  ];

  constructor(private router: Router) {}

  /**
   * Navega para a rota do card
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
