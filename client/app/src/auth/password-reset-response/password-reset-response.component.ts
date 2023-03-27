import { Component } from '@angular/core';
import {password_recovery_model} from "../../dataModels/authentication/password_recovery_model";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {HttpService} from "../../services/http.service";

@Component({
  selector: 'src-password-reset-response',
  templateUrl: './password-reset-response.component.html',
  styleUrls: ['./password-reset-response.component.css']
})
export class PasswordResetResponseComponent {
  state = "start";
  request = new password_recovery_model()

  submit() {
    let requestObservable:Observable<any>

    requestObservable = this.httpService.requestChangePassword(JSON.stringify({"reset_token":this.request.reset_token,"recovery_key":this.request.recovery_key,"auth_code":this.request.auth_code}))
    requestObservable.subscribe(
      {
        next: response => {

          if(response.status === "success") {
            location.replace("/login?token=" + response.token);
          } else {
            if (response.status === "require_recovery_key") {
              this.request.recovery_key = "";
            }
            this.request.auth_code = "";
            this.state = response.status;
          }
        },
        error: (error: any) => {
        }
      }
    );













    /*$http.put("api/reset/password", $scope.request).then(function(response) {
      if(response.data.status === "success") {
        $location.url("/login?token=" + response.data.token);
      } else {
        if (response.data.status === "require_recovery_key") {
          $scope.request.recovery_key = "";
        }

        $scope.request.auth_code = "";
        $scope.state = response.data.status;
      }
    });*/
  };

  constructor(private route: ActivatedRoute, public httpService: HttpService) {
    this.request.reset_token = this.route.snapshot.queryParams["token"] || ""
    this.request.recovery_key = this.route.snapshot.queryParams["recovery"] || ""

    if(this.state == "start"){
      this.submit()
    }
  }

}
