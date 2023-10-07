import {HostListener, NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { AuthModule } from './pages/auth/auth.module';
import {
  APP_BASE_HREF,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { OrderModule } from 'ngx-order-pipe'; // <- import OrderModule
import { AppConfigService } from './services/app-config.service';
import { SharedModule } from './shared.module';
import { HeaderComponent } from './shared/partials/header/header.component';
import { UserComponent } from './shared/partials/header/template/user/user.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {CompletedInterceptor, ErrorCatchingInterceptor, RequestInterceptor} from "./services/request.interceptor";
import {Keepalive, NgIdleKeepaliveModule} from "@ng-idle/keepalive";
import {DEFAULT_INTERRUPTSOURCES, Idle} from "@ng-idle/core";
import {AuthenticationService} from "./services/authentication.service";
import {HomeComponent} from "./pages/dashboard/home/home.component";
import { TranslatorPipe } from './shared/pipes/translate';
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";
import {ActionModule} from "./pages/action/action.module";
import {WhistleblowerModule} from "./pages/whistleblower/whistleblower.module";
import {MarkdownModule} from "ngx-markdown";
import {ReceiptvalidatorDirective} from "./shared/directive/receiptvalidator.directive";
import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import * as Flow from "@flowjs/flow.js";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SignupModule} from "./pages/signup/signup.module";
import { WizardModule } from './pages/wizard/wizard.module';
import { RecipientModule } from './pages/recipient/recipient.module';
import { AdminModule } from './pages/admin/admin.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './data/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, HeaderComponent, UserComponent, HomeComponent],
  imports: [
    NgbModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    BrowserModule,
    NgxFlowModule,
    NgIdleKeepaliveModule.forRoot(),
    MarkdownModule.forRoot(),
    AuthModule,
    SignupModule,
    ActionModule,
    OrderModule,
    WizardModule,
    AdminModule,
    RecipientModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgSelectModule,
    FormsModule,
    WhistleblowerModule,
  ],
  providers: [
    ReceiptvalidatorDirective,
    TranslatorPipe,TranslateService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorCatchingInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: CompletedInterceptor, multi: true},
    { provide: FlowInjectionToken, useValue: Flow}
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {

  timedOut = false;
  title = 'angular-idle-timeout';

  constructor(public appConfigService: AppConfigService, private idle: Idle, private keepalive: Keepalive, public authentication: AuthenticationService) {
    this.globalInitializations();
    this.initIdleState();
  }

  @HostListener('window:beforeunload')
  async ngOnDestroy() {
    this.reset();
  }

  globalInitializations() {
    this.appConfigService.initTranslation();
  }

  initIdleState(){
    this.idle.setIdle(300);
    this.idle.setTimeout(1800);
    this.keepalive.interval(600);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onTimeout.subscribe(() => {
      if (this.authentication && this.authentication.session) {
        if (this.authentication.session.role === "whistleblower") {
          window.location.replace("about:blank");
        } else {
          this.authentication.deleteSession();
          this.authentication.loginRedirect(false)
        }
      }
    });

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.timedOut = false;
    this.authentication.reset()
  }
}

