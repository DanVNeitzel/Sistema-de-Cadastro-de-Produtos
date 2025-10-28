/**
 * Configuração de rotas da aplicação
 * Define as rotas principais e suas respectivas configurações de lazy loading
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rota padrão - página inicial
  {
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(c => c.HomeComponent),
    title: 'Home'
  },
  
  // Rota para listagem de produtos
  {
    path: 'products',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(c => c.ProductListComponent),
    title: 'Lista de Produtos'
  },
  
  // Rota para criação de novo produto
  {
    path: 'products/new',
    loadComponent: () => import('./components/product-form/product-form.component')
      .then(c => c.ProductFormComponent),
    title: 'Novo Produto'
  },
  
  // Rota para edição de produto existente
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./components/product-form/product-form.component')
      .then(c => c.ProductFormComponent),
    title: 'Editar Produto'
  },
  
  // Rota para visualização detalhada do produto
  {
    path: 'products/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component')
      .then(c => c.ProductDetailComponent),
    title: 'Detalhes do Produto'
  },
  
  // Rota para páginas não encontradas
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component')
      .then(c => c.NotFoundComponent),
    title: 'Página não encontrada'
  }
];