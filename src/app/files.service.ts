import { Injectable } from '@angular/core';
import Photoshop from './shared/models/photoshop';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor() {

  }

  getFiles() {
  }

  async setFiles(files: FileList) {
    for (let i = 0, f; i < files.length; i++ ) {
      f = files[i];
      console.log(f);

      switch (f.type) {
        case 'image/vnd.adobe.photoshop':
          const photoshop = new Photoshop();
          await photoshop.read(f);
          photoshop.getXMPMetadata();

          // DocumentID を引いてこいつのあれにセットする
          // 最終的には雑に Event でも発火してあげればいいのでは?
      }
    }
  }
}
