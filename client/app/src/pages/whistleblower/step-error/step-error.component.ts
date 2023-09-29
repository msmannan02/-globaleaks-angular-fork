import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SubmissionComponent} from "../submission/submission.component";
import {SubmissionService} from "../../../services/submission.service";
import {FormArray, FormGroup, NgForm} from "@angular/forms";

@Component({
  selector: 'src-step-error',
  templateUrl: './step-error.component.html',
  styleUrls: ['./step-error.component.css']
})
export class StepErrorComponent {
  @Input() navigation: number;

  @Input() displayStepErrors: Function;
  @Input() stepForm: Function;
  @Input() submission: SubmissionService;
  @Input() stepforms: any;
  @Input() field_id_map: any;

  @Output() goToStep: EventEmitter<any> = new EventEmitter();

  getInnerGroupErrors(form: NgForm): string[] {
    const errors: string[] = [];
    this.processFormGroup(form.form, errors);
    return errors;
  }

  private processFormGroup(formGroup: FormGroup, errors: string[], parentControlName = ''): void {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.controls[controlName];

      if (control instanceof FormGroup) {
        const nestedControlName = parentControlName ? `${parentControlName}.${controlName}` : controlName;
        this.processFormGroup(control, errors, nestedControlName);
      } else if (control instanceof FormArray) {
        control.controls.forEach((nestedControl, index) => {
          const nestedControlName = parentControlName ? `${parentControlName}.${controlName}[${index}]` : `${controlName}[${index}]`;
          this.processFormGroup(nestedControl as FormGroup, errors, nestedControlName);
        });
      } else if (control.errors) {
        errors.push(parentControlName);
      }
    });
  }
}
