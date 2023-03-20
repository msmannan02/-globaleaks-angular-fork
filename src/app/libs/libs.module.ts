import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InternationalizationComponent } from './internationalization/internationalization.component';
import { LibsRoutingModule } from './libs-routing.module';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { QRCodeModule } from 'angularx-qrcode';
import { FastshaComponent } from './fastshah/fastsha.component';
// import { ShowdownComponent } from './showdown/showdown.component';
// import { ShowdownModule } from 'ngx-showdown';
import { FormsModule } from '@angular/forms';
import { IdleComponent } from './idle/idle.component';
import { NgIdleModule } from '@ng-idle/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { SelectComponent } from './select/select.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    InternationalizationComponent,
    FastshaComponent,
    QrCodeComponent,
    // ShowdownComponent,
    IdleComponent,
    SelectComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    LibsRoutingModule,
    FormsModule,
    // ShowdownModule,
    QRCodeModule,
    NgIdleModule,
    NgSelectModule,
    NgIdleKeepaliveModule.forRoot(),
  ],
})
export class LibsModule {}
