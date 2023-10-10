import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { FlowDirective } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'app/src/services/authentication.service';

@Component({
  selector: 'src-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements AfterViewInit, OnDestroy{
  @ViewChild('flowAdvanced')
  flow: FlowDirective;
  @ViewChild('uploader') uploaderElementRef!: ElementRef<HTMLInputElement>;

  @Input() imageUploadModel: any;
  @Input() imageUploadModelAttr: string;
  @Input() imageUploadId: string;
  imageUploadObj: any = {
      files: [],
  };
  autoUploadSubscription: Subscription;

  constructor(private http: HttpClient,public authenticationService:AuthenticationService) {}
  ngOnInit() {}
  ngAfterViewInit() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {
      if (event.type === 'filesSubmitted') {
        this.imageUploadModel[this.imageUploadModelAttr] = true;
      }
    });
  }
  onFileSelected(files: FileList | null) {
    if (files && files.length > 0) {
      const file = files[0];
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.pop(); // Remove the file extension
      const fileNameWithoutExtension = fileNameParts.join('.'); // Join the rest of the file name without extension
      const timestamp = new Date().getTime();
      const fileNameWithTimestamp = `${fileNameWithoutExtension}_${timestamp}.${fileExtension}`;
      const modifiedFile = new File([file], fileNameWithTimestamp, { type: file.type });
      const flowJsInstance = this.flow.flowJs;

      flowJsInstance.addFile(modifiedFile);
      flowJsInstance.upload();
    }
  }

  triggerFileInputClick() {
    this.uploaderElementRef.nativeElement.click();
  }
  ngOnDestroy() {
    this.autoUploadSubscription.unsubscribe();
  }

  deletePicture() {
    this.http
      .delete("/api/admin/files/" + this.imageUploadId)
      .subscribe(() => {
        if (this.imageUploadModel) {
          this.imageUploadModel[this.imageUploadModelAttr] = "";
        }
        this.imageUploadObj.files = [];
      });
  }
}
