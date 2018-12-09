import { Injectable } from '@angular/core';
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
  files: Map<string, FileDetail>;

  constructor() {
    this.files = new Map<string, FileDetail>();
  }

  getFiles(): IterableIterator<[string, FileDetail]> {
    return this.files.entries();
  }

  async addFiles(files: FileList) {
    for (let i = 0, f; i < files.length; i++ ) {
      f = files[i];
      console.log(f);

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
      console.log(metadata);
      this.files.set(metadata.xmpMMDocumentID, {
        file: f,
        meta: metadata,
      });
    }
  }
}
