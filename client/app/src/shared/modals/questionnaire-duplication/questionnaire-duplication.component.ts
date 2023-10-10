import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'src-questionnaire-duplication',
  templateUrl: './questionnaire-duplication.component.html'
})
export class QuestionnaireDuplicationComponent {
  @Input() questionnaire: any;
  @Input() operation: any;
  duplicate_questionnaire: { name: string } = { name: '' };
  constructor(private utilsService: UtilsService, private http: HttpClient, public activeModal: NgbActiveModal, private modalService: NgbModal,) { }
  cancel() {
    this.modalService.dismissAll();
  }
  confirm() {
    if (this.operation === "duplicate") {
      this.http.post(
        "/api/admin/questionnaires/duplicate",
        {
          questionnaire_id: this.questionnaire.id,
          new_name: this.duplicate_questionnaire.name
        }
      ).subscribe(() => {
        this.modalService.dismissAll();
        this.utilsService.reloadCurrentRoute()

      })
    }
  }
}
