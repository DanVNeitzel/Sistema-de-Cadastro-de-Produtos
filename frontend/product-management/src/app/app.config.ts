/**
 * Configuração principal da aplicação Angular
 * Define providers globais, interceptors e configurações de bootstrapping
 */

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { PoModule } from '@po-ui/ng-components';
import { ProductService } from './services/product.service';
import { ProductMockService } from './services/product-mock.service';
import { ProductApiService } from './services/product-api.service';
import { environment } from '../environments/environment';

/**
 * Configuração da aplicação com providers essenciais
 * - Roteamento
 * - Cliente HTTP com interceptors
 * - Módulos do PO-UI
 * - Animações do browser
 * - Feature Flag para alternar entre Mock e API Real
 * 
 * FEATURE FLAG: environment.useMockData controla qual serviço será usado
 * - true: ProductMockService (dados simulados em memória)
 * - false: ProductApiService (chamadas HTTP reais para backend)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Configuração de rotas
    provideRouter(routes),
    
    // Cliente HTTP com interceptors
    provideHttpClient(withInterceptorsFromDi()),
    
    // Importação do módulo PO-UI
    importProvidersFrom(
      PoModule,
      BrowserAnimationsModule
    ),
    
    // ✅ FEATURE FLAG: Alterna entre Mock e API Real
    {
      provide: ProductService,
      useClass: environment.useMockData ? ProductMockService : ProductApiService
    }
    
    // Aqui serão adicionados outros providers conforme necessário
    // httpInterceptorProviders, // Será descomentado após resolver dependências
  ]
};
