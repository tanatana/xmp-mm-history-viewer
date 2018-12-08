import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'xmp-mm-history-viewer';
  dragEnterCounter = 0;
  constructor() { }

  ngOnInit() {
  }

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragEnterCounter++;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragEnterCounter--;
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragEnterCounter = 0;
    console.log('files:', e.dataTransfer.files.length);
  }
}
