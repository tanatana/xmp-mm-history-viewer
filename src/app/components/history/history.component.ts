import { Component, OnInit } from '@angular/core';
import { FilesService, FileDetail } from '../../files.service';
import { MetadataHistory } from '../../shared/models/xmp';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  fileDetails: Array<FileDetail>;

  constructor(private filesService: FilesService) {
    this.fileDetails = [];
    this.filesService.OnLoadNotifier.subscribe(() => {
      const files = this.filesService.getFiles();
      this.buildHistoryTree(files);
    });
  }

  ngOnInit() {
  }

  buildHistoryTree(files: Map<string, FileDetail>) {
   const fileDetails = new Array<FileDetail>();

   files.forEach((file, id) => {
     fileDetails.push(file);
   });
   fileDetails.sort((a, b) => {
    return a.meta.xmpMMHistory.length - b.meta.xmpMMHistory.length;
   });

   this.fileDetails = fileDetails;
  }

  getFiles() {
    return this.filesService.getFiles();
  }
}
