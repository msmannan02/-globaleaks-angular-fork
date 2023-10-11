import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpClient, HttpErrorResponse,
} from '@angular/common/http';
import {catchError, finalize, from, Observable, switchMap, throwError} from 'rxjs';
import {tokenResponse} from "../models/authentication/token-response";
import {CryptoService} from "../crypto.service";
import {AuthenticationService} from "./authentication.service";
import {AppDataService} from "../app-data.service";
import {TranslationService} from "./translation.service";
import {ActivatedRoute} from "@angular/router";
import {AppConfigService} from "./app-config.service";
import {errorCodes} from "../models/app/error-code";

const protectedUrls = [
  'api/wizard',
  'api/signup',
  'api/whistleblower/submission',
  'api/auth/receiptauth',
  'api/auth/tokenauth',
  'api/auth/authentication',
  'api/user/reset/password',
  'api/user/preferences',
  'api/recipient/rtip',
];

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private httpClient: HttpClient,
    private cryptoService: CryptoService,
    private translationService: TranslationService
  ) {
  }

  private getAcceptLanguageHeader(): string | null {
    if (this.translationService.language) {
      return this.translationService.language;
    } else {
      const url = window.location.href;
      const hashFragment = url.split('#')[1];

      if (hashFragment && hashFragment.includes('lang=')) {
        return hashFragment.split('lang=')[1].split('&')[0];
      } else {
        return "";
      }
    }
  }

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (httpRequest.url.endsWith('/data/i18n/.json')) {
      return next.handle(httpRequest);
    }

    let authHeader = this.authenticationService.getHeader();
    let authRequest = httpRequest;

    for (let [key, value] of authHeader) {
      authRequest = authRequest.clone({headers: authRequest.headers.set(key, value)});
    }

    authRequest = authRequest.clone({
      headers: authRequest.headers.set('Accept-Language', this.getAcceptLanguageHeader() || ''),
    });

    if (protectedUrls.includes(httpRequest.url)) {
      return this.httpClient.post('api/auth/token', {}).pipe(
        switchMap((response) => from(this.cryptoService.proofOfWork(Object.assign(new tokenResponse(), response).id)).pipe(
          switchMap((ans) => next.handle(httpRequest.clone({
            headers: httpRequest.headers.set('x-token', Object.assign(new tokenResponse(), response).id + ':' + ans)
              .set('Accept-Language', this.getAcceptLanguageHeader() || ''),
          })))
        ))
      );
    } else {
      return next.handle(authRequest);
    }
  }
}

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {

  constructor(private authenticationService:AuthenticationService, private appDataService:AppDataService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error['error_code'] === 10) {
            this.authenticationService.deleteSession()
            this.authenticationService.reset()
            this.authenticationService.routeLogin()
          }
          else if (error.error['error_code'] === 6 && this.authenticationService.isSessionActive()) {
            if (this.authenticationService.session.role !== "whistleblower") {
              location.pathname = this.authenticationService.session.homepage
            }
          }
          this.appDataService.errorCodes = new errorCodes(error.error['error_message'], error.error['error_code'], error.error['arguments']);
          return throwError(() => error);
        })
      )
  }
}

@Injectable()
export class CompletedInterceptor implements HttpInterceptor {

  count=0
  constructor(private appDataService:AppDataService) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.count === 0) {
      this.appDataService.showLoadingPanel = true
    }
    this.count++;
    return next.handle(req).pipe(
    finalize(() => {
      this.count--;
      if (this.count === 0 && req.url != "api/auth/token") {
        this.appDataService.showLoadingPanel = false
      }
    }));
  }
}
