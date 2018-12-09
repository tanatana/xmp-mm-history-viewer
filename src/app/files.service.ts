import { Injectable } from '@angular/core';
import Photoshop from './shared/models/photoshop';
import { ParseXMPMetadata } from './shared/models/xmp';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor() {

  }

  getFiles() {
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
      console.log(metadataStr);
      const metadata = ParseXMPMetadata(metadataStr);
      console.log(metadata);
    }
  }
}
