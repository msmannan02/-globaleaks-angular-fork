import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from 'app/src/shared/services/http.service';
import { UtilsService } from 'app/src/shared/services/utils.service';
import { new_field } from "../../../../models/admin/new_field";
import { field_template } from "../../../../models/admin/fieldTemplate";
import { QuestionnariesService } from '../questionnaries.service';

@Component({
  selector: 'src-add-field',
  templateUrl: './add-field.component.html',
  styleUrls: ['./add-field.component.css']
})
export class AddFieldComponent implements OnInit {
  @Output() dataToParent = new EventEmitter<string>();
  @Input() step: any
  @Input() type: any;
  new_field: any = {};
  fields: any

  constructor(private questionnariesService: QuestionnariesService,private httpService: HttpService, private utilsService: UtilsService) {
    this.new_field = {
      label: '',
      type: ''
    };
  }
  ngOnInit(): void {
    if (this.step) {
      this.fields = this.step.children
    }
  }
  add_field() {
    if (this.type === "step") {

      let field = new new_field()
      field.step_id = this.step.id
      field.template_id = ""

      field.label = this.new_field.label,
        field.type = this.new_field.type,
        field.y = this.utilsService.newItemOrder(this.fields, "y");
      if (field.type === 'fileupload') {
        field.multi_entry = true;
      }
      this.httpService.requestAddAdminQuestionnaireField(field).subscribe((newField: any) => {
        this.fields.push(newField);
        this.new_field = {
          label: '',
          type: ''
        };
        this.dataToParent.emit();
       return this.questionnariesService.sendData()
        // this.utilsService.reloadCurrentRoute()
      });
    }
    if (this.type === "template") {
      var field = new field_template()
      field.fieldgroup_id = this.fields ? this.fields.id : ""
      field.instance = "template";
      field.label = this.new_field.label;
      field.type = this.new_field.type;
      this.httpService.requestAddAdminQuestionnaireFieldTemplate(field).subscribe((newField: any) => {
        // this.fields.push(newField);
        this.new_field = {
          label: '',
          type: ''
        };
        this.dataToParent.emit();
        return this.questionnariesService.sendData()
        // this.utilsService.reloadCurrentRoute()
      });
    }
    if (this.type === "field") {

      let field = new new_field()
      field.fieldgroup_id = this.step.id
      field.template_id = ""

      field.label = this.new_field.label,
        field.type = this.new_field.type,
        field.y = this.utilsService.newItemOrder(this.step.children, "y");
      if (field.type === 'fileupload') {
        field.multi_entry = true;
      }
      field.instance = this.step.instance;
      this.httpService.requestAddAdminQuestionnaireField(field).subscribe((newField: any) => {
        this.step.children.push(newField);
        this.new_field = {
          label: '',
          type: ''
        };
        this.dataToParent.emit();
        return this.questionnariesService.sendData()
        // this.utilsService.reloadCurrentRoute()
      });
    }
  }

  toggleAddQuestion() {
    // Implement your logic to toggle the "Add Question" form visibility
  }
}
