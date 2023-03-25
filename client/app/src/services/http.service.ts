import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpService{

  getPublicResource(): Observable<any>{
    return this.httpClient.get<any>("/api/public");
  }
  requestGeneralLogin(param: string): Observable<any>{
    const headers = { 'content-type': 'application/json'}
    return this.httpClient.post("api/authentication", param,{'headers':headers })
  }

  constructor(private httpClient: HttpClient) {
  }
}
