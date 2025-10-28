/**
 * Interceptor HTTP para tratamento global de requisições
 * Adiciona headers padrão, loading global e tratamento de erros
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, finalize, retry, retryWhen, mergeMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Serviço para controle global de loading
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requestCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  /**
   * Incrementa contador de requisições ativas
   */
  startLoading(): void {
    this.requestCount++;
    this.updateLoadingState();
  }

  /**
   * Decrementa contador de requisições ativas
   */
  stopLoading(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    this.updateLoadingState();
  }

  /**
   * Atualiza estado do loading baseado no contador
   */
  private updateLoadingState(): void {
    this.isLoadingSubject.next(this.requestCount > 0);
  }

  /**
   * Força reset do loading
   */
  reset(): void {
    this.requestCount = 0;
    this.isLoadingSubject.next(false);
  }
}

/**
 * Interceptor para requisições HTTP
 * Aplica configurações globais e tratamentos padrão
 */
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private loadingService: LoadingService) {}

  /**
   * Intercepta todas as requisições HTTP
   * @param req Requisição original
   * @param next Handler para continuar a cadeia
   * @returns Observable com a resposta tratada
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Inicia loading global
    this.loadingService.startLoading();

    // Clona a requisição para adicionar headers padrão
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Token de autenticação será adicionado aqui quando implementado
        // 'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });

    if (environment.enableDebugMode) {
      console.log('HTTP Request:', {
        method: modifiedReq.method,
        url: modifiedReq.url,
        headers: modifiedReq.headers.keys(),
        body: modifiedReq.body
      });
    }

    return next.handle(modifiedReq).pipe(
      // Log de sucesso em modo debug
      tap(event => {
        if (environment.enableDebugMode && event.type === 4) { // HttpEventType.Response
          console.log('HTTP Response:', event);
        }
      }),
      
      // Retry automático para erros de rede (mas não para erros 4xx)
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Não retry em erros de cliente (4xx) ou se já tentou 2 vezes
            if (error.status >= 400 && error.status < 500 || index >= 2) {
              return throwError(() => error);
            }
            // Retry com delay exponencial: 1s, 2s
            const delayTime = Math.pow(2, index) * 1000;
            console.log(`Tentando novamente em ${delayTime}ms...`);
            return timer(delayTime);
          })
        )
      ),
      
      catchError((error: HttpErrorResponse) => {
        // Log detalhado do erro
        const errorDetails = {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error,
          timestamp: new Date().toISOString()
        };

        if (environment.enableDebugMode) {
          console.error('❌ Erro HTTP interceptado:', errorDetails);
        }

        // Mensagens de erro amigáveis
        let friendlyMessage = 'Erro na comunicação com o servidor';
        let technicalMessage = error.message;
        
        if (error.error instanceof ErrorEvent) {
          // Erro do lado do cliente (ex: rede)
          friendlyMessage = 'Erro de conexão. Verifique sua internet.';
          technicalMessage = error.error.message;
        } else {
          // Erro do lado do servidor
          switch (error.status) {
            case 0:
              friendlyMessage = 'Servidor indisponível. Verifique sua conexão com a internet.';
              technicalMessage = 'Network error or CORS issue';
              break;
            case 400:
              friendlyMessage = error.error?.message || 'Dados inválidos enviados ao servidor.';
              technicalMessage = JSON.stringify(error.error);
              break;
            case 401:
              friendlyMessage = 'Acesso não autorizado. Faça login novamente.';
              technicalMessage = 'Authentication required';
              // Aqui você pode redirecionar para login
              // this.router.navigate(['/login']);
              break;
            case 403:
              friendlyMessage = 'Acesso proibido. Você não tem permissão para esta operação.';
              technicalMessage = 'Forbidden';
              break;
            case 404:
              friendlyMessage = 'Recurso não encontrado.';
              technicalMessage = `Resource not found: ${error.url}`;
              break;
            case 409:
              friendlyMessage = error.error?.message || 'Conflito. O recurso já existe.';
              technicalMessage = JSON.stringify(error.error);
              break;
            case 422:
              friendlyMessage = error.error?.message || 'Dados não processáveis. Verifique as informações enviadas.';
              technicalMessage = JSON.stringify(error.error?.errors || error.error);
              break;
            case 429:
              friendlyMessage = 'Muitas requisições. Aguarde um momento e tente novamente.';
              technicalMessage = 'Rate limit exceeded';
              break;
            case 500:
              friendlyMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              technicalMessage = 'Internal server error';
              break;
            case 502:
              friendlyMessage = 'Servidor temporariamente indisponível (Bad Gateway).';
              technicalMessage = 'Bad Gateway';
              break;
            case 503:
              friendlyMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
              technicalMessage = 'Service Unavailable';
              break;
            case 504:
              friendlyMessage = 'Tempo limite excedido. O servidor demorou muito para responder.';
              technicalMessage = 'Gateway Timeout';
              break;
            default:
              friendlyMessage = `Erro ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
              technicalMessage = error.message;
          }
        }

        // Retorna erro enriquecido com mensagens amigáveis
        const enrichedError = {
          ...error,
          friendlyMessage,
          technicalMessage,
          errorDetails,
          timestamp: new Date()
        };

        return throwError(() => enrichedError);
      }),
      
      finalize(() => {
        // Para loading global independente do resultado
        this.loadingService.stopLoading();
      })
    );
  }
}

/**
 * Provider para o interceptor
 * Deve ser adicionado ao app.config.ts
 */
export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpRequestInterceptor,
    multi: true
  }
];