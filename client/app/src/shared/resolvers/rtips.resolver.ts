import { Injectable } from '@angular/core';
import {
  Resolve
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {HttpService} from "../services/http.service";
import {rtipsResolverModel} from "../../models/resolvers/rtipsResolverModel";
import { AuthenticationService } from 'app/src/services/authentication.service';
import {catchError, map} from "rxjs/operators";
import {preferenceResolverModel} from "../../models/resolvers/preferenceResolverModel";

@Injectable({
  providedIn: 'root'
})
export class RtipsResolver implements Resolve<boolean> {
  dataModel: rtipsResolverModel = new rtipsResolverModel();

  constructor(
    private httpService: HttpService,
    private authenticationService: AuthenticationService
  ) {}

  resolve(): Observable<boolean> {
    if (this.authenticationService.session.role === 'receiver') {
      return this.httpService.recieverTipResource().pipe(
        map((response: rtipsResolverModel) => {
          this.dataModel = response;
          alert(JSON.stringify(response))
          return true;
        })
      );
    }
    return of(true);
  }
}
