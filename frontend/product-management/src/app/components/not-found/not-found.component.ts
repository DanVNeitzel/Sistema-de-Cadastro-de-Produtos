/**
 * Componente para página não encontrada (404)
 * Interface amigável para rotas inválidas
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Importações PO-UI
import {
  PoPageModule,
  PoButtonModule,
  PoContainerModule,
  PoAvatarModule
} from '@po-ui/ng-components';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    PoPageModule,
    PoButtonModule,
    PoContainerModule,
    PoAvatarModule
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  
  constructor(private router: Router) {}

  /**
   * Navega de volta para a página inicial
   */
  goHome(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Volta para a página anterior
   */
  goBack(): void {
    window.history.back();
  }
}