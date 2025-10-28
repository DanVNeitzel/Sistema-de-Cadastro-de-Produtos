/**
 * Arquivo principal para inicialização da aplicação Angular
 * Este arquivo é responsável por fazer o bootstrap da aplicação
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Inicializa a aplicação Angular com o componente raiz e configurações
 * Utiliza o standalone bootstrap para melhor performance e organização
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err: Error) => console.error(err));