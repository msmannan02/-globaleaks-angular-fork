import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SimpleLoginComponent } from './login/templates/simple-login/simple-login.component';
import { DefaultLoginComponent } from './login/templates/default-login/default-login.component';
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    LoginComponent,
    SimpleLoginComponent,
    DefaultLoginComponent
  ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
    ]
})
export class AuthModule { }