import { Injectable, EventEmitter } from '@angular/core';
import Photoshop from './shared/models/photoshop';
import { ParseXMPMetadata, Metadata } from './shared/models/xmp';

export interface FileDetail {
  file: File;
  meta: Metadata;
}

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  public OnLoadNotifier: EventEmitter<boolean> = new EventEmitter<boolean>();
  files: Map<string, FileDetail>;

  constructor() {
    this.files = new Map<string, FileDetail>();
  }

  getFiles(): Map<string, FileDetail> {
    return this.files;
  }

  async addFiles(files: FileList) {
    for (let i = 0, f; i < files.length; i++ ) {
      f = files[i];

      let metadataStr: string;
      switch (f.type) {
        case 'image/vnd.adobe.photoshop':
          const photoshop = new Photoshop();
          await photoshop.read(f);
          metadataStr = photoshop.getXMPMetadata();
          // DocumentID を引いてこいつのあれにセットする
          // 最終的には雑に Event でも発火してあげればいいのでは?
      }
      const metadata = ParseXMPMetadata(metadataStr);
      this.files.set(metadata.xmpMMDocumentID, {
        file: f,
        meta: metadata,
      });
    }

    this.OnLoadNotifier.emit(true);
  }
}
