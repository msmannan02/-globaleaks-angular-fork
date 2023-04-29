import { Injectable } from '@angular/core';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot, Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {HttpService} from "../services/http.service";
import {preferenceResolverModel} from "../../models/resolvers/preferenceResolverModel";

@Injectable({
  providedIn: 'root'
})
export class PreferenceResolver implements Resolve<boolean> {

  dataModel:preferenceResolverModel = new preferenceResolverModel()

  resolve(route: ActivatedRouteSnapshot, c: RouterStateSnapshot): Observable<boolean> {
    let requestObservable = this.httpService.requestPreferenceResource({"update": {method: "PUT"}})
    requestObservable.subscribe(
        {
            next: (response:preferenceResolverModel) => {
                this.dataModel = response
                if (this.dataModel.password_change_needed) {
                    this.router.navigate(["/action/forcedpasswordchange"]);
                } else if (this.dataModel.require_two_factor) {
                    this.router.navigate(["/action/forcedtwofactor"]);
                }
            },
            error: (error: any) => {
            }
        }
    );
    return of(true);
  }

  constructor(public httpService: HttpService, private router: Router) {
  }
}