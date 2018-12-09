import { Component, OnInit } from '@angular/core';
import { FilesService } from '../../files.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  constructor(private filesService: FilesService) { }

  ngOnInit() {
  }

  getFiles() {
    return this.filesService.getFiles();
  }
}
