import { Injectable } from '@angular/core';
import { LoginDataRef } from '../pages/auth/login/model/login-model';
import { HttpService } from '../shared/services/http.service';
import { Observable } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { AppDataService } from '../app-data.service';
import { errorCodes } from '../models/app/error-code';
import {AppConfigService} from "./app-config.service";
import {ServiceInstanceService} from "../shared/services/service-instance.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public session: any = undefined;

  loginInProgress: boolean = false;
  requireAuthCode: boolean = false;
  loginData: LoginDataRef = new LoginDataRef();

  public appConfigService:AppConfigService

  constructor(private serviceInstanceService:ServiceInstanceService, private activatedRoute: ActivatedRoute, public httpService: HttpService, public rootDataService: AppDataService, private router: Router) {
  }

  init(){
    this.appConfigService = this.serviceInstanceService.appConfigService

    let json = window.sessionStorage.getItem("session")
    if (json != null) {
      this.session = JSON.parse(json);
    } else {
      this.session = undefined
    }
  }

  public reset() {
    this.loginInProgress = false;
    this.requireAuthCode = false;
    this.loginData = new LoginDataRef();
  };

  deleteSession() {
    this.session = null;
    window.sessionStorage.removeItem("session");
  };

  isSessionActive() {
    return this.session;
  }

  routeLogin() {
    this.loginRedirect();
  }

  setSession(response: any) {
    this.session = response;
    if (this.session.role !== "whistleblower") {
      let role = this.session.role === "receiver" ? "recipient" : this.session.role;

      this.session.homepage = "/" + role + "/home";
      this.session.preferencespage = "/" + role + "/preferences";
      window.sessionStorage.setItem("session", JSON.stringify(this.session));
    }
  }

  resetPassword(username: string) {
    const param = JSON.stringify({ "username": username });
    this.httpService.requestResetLogin(param).subscribe(
      {
        next: () => {
          this.router.navigate(['/login/passwordreset/requested']).then();
        }
      }
    );
  }

  login(tid?: any, username?: any, password?: any, authcode?: any, authtoken?: any, callback?: () => void) {

    if (authtoken === undefined) {
      authtoken = "";
    }
    if (authcode === undefined) {
      authcode = "";
    }

    let requestObservable: Observable<any>;
    this.loginInProgress = true;
    this.rootDataService.showLoadingPanel = true;
    if (authtoken) {
      requestObservable = this.httpService.requestAuthTokenLogin(JSON.stringify({ "authtoken": authtoken }));
    } else {
      if (username === "whistleblower") {
        password = password.replace(/\D/g, "");
        requestObservable = this.httpService.requestWhistleBlowerLogin(JSON.stringify({ "receipt": password }));
      } else {
        requestObservable = this.httpService.requestGeneralLogin(JSON.stringify({ "tid": tid, "username": username, "password": password, "authcode": authcode }));
      }
    }

    requestObservable.subscribe(
      {
        next: (response: any) => {
          this.rootDataService.showLoadingPanel = false
          this.reset();
          this.setSession(response)

          if ("redirect" in response) {
            this.router.navigate([response.data.redirect]).then();
          }

          let src = location.search;
          if (src) {
            location.replace(src);
          } else {
            if (this.session.role === "whistleblower") {
              if (password) {
                this.rootDataService.receipt = password
                this.rootDataService.page = "tippage";
                this.router.navigate(['/']).then();
              }
            } else {
              if(!callback){
                this.router.navigate([this.session.homepage], {
                  queryParams: this.activatedRoute.snapshot.queryParams,
                  queryParamsHandling: 'merge'
                });
              }
            }
          }
          if (callback) {
            callback()
          }
        },
        error: (error: any) => {
          this.loginInProgress = false;
          this.rootDataService.showLoadingPanel = false
          if (error.error && error.error.error_code) {
            if (error.error.error_code === 4) {
              this.requireAuthCode = true;
            } else if (error.error.error_code !== 13) {
              this.reset();
            }
          }

          this.rootDataService.errorCodes = new errorCodes(error.error.error_message, error.error.error_code, error.error.arguments);
        }
      }
    );
  }

  public getHeader(confirmation?: string) {
    let header = new Map<string, string>();
    if (this.session) {
      header.set("X-Session", this.session.id);
      header.set("Accept-Language", "en");
    }
    if (confirmation) {
      header.set("X-Confirmation", confirmation);
    }

    return header;
  }

  logout(callback?: () => void) {
    let requestObservable = this.httpService.requestDeleteUserSession();
    requestObservable.subscribe(
      {
        next: () => {
          if (this.session.role === "whistleblower") {
            this.deleteSession();
            this.rootDataService.page = "homepage";
          } else {
            this.deleteSession();
            this.loginRedirect();
          }
          if(callback){
            callback();
          }
        }
      }
    );
  };

  loginRedirect() {
    let source_path = location.pathname;

    if (source_path !== "/login") {
      this.router.navigateByUrl("/login").then()
    }
  };
}
