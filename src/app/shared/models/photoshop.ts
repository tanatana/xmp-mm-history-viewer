
export default class Photoshop {
  offset: {
    colorMode: number,
    imageResource: number,
  };
  size: {
    colorMode: number
    imageResrouce: number,
  };
  body: ArrayBuffer;
  xmpMM: {
    DocumentID: string
  };

  constructor () {
    this.offset = {
      colorMode: 26,
      imageResource: 0,
    };

    this.size = {
      colorMode: 0,
      imageResrouce: 0,
    };
  }

  validate() {
    // this marker should be '8BPS'
    const fileHeaderMarker = new Uint8Array(this.body, 0, 4);
    if (fileHeaderMarker[0] === 56 &&
       fileHeaderMarker[1] === 66 &&
       fileHeaderMarker[2] === 80 &&
       fileHeaderMarker[3] === 83) {
        // OK: do nothing.
      } else {
      throw(new Error('Invalid file header marker'));
    }

    // Standard: 26 + 4
    const colorModeLengthView = new DataView(this.body, this.offset.colorMode, 4);
    this.size.colorMode = colorModeLengthView.getInt32(0);
    this.offset.imageResource = this.offset.colorMode + 4 + this.size.colorMode;

    // Standard: 30 + 4
    const imageResourceLengthView = new DataView(this.body, this.offset.imageResource, 4);
    this.size.imageResrouce = imageResourceLengthView.getInt32(0);
  }

  getXMPMetadata(): string {
    let xmpDetectionFlag = false;
    // image resource offset + 4 (image resource length)
    const offset = this.offset.imageResource + 4;

    for (let i = offset; i < offset + this.size.imageResrouce; ) {
      // image resrouce block marker should be '8BIM'
      const marker = new Uint8Array(this.body, i, 4);
      // console.log(marker);
      if (marker[0] === 56 &&
        marker[1] === 66 &&
        marker[2] === 73 &&
        marker[3] === 77) {
        // OK: do nothing.
      } else {
        // 1文字だけ進めてもう一回 marker を探す
        i += 1;
        continue;
      }

      // image resrouce block id
      const idView = new DataView(this.body, i + 4, 2);
      const id = idView.getInt16(0);
      if (id !== 1060) {
        // XMP = 1060 じゃない場合はIDのバイト長分進めて marker 探しからやり直し
        i += 2;
        continue;
      }
      xmpDetectionFlag = true;
      // Ignore null name field (a null name consists of two bytes of 0)
      // so, offset is
      const sizeView = new DataView(this.body, i + 8, 4);
      const size = sizeView.getInt32(0);
      const xpacket = new Uint8Array(this.body, i + 12, size);
      const xpacketString: String = String.fromCharCode.apply(null, xpacket);
      return xpacketString.replace(/^\<\?xpacket.*\>\n/g, '');
    }
    throw (new Error('XMP data was not found'));
  }

  read(file: File): Promise<string> {
    const loadStartAt = Date.now();
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      // Closure to capture the file information.
      reader.onload = ((f) => {
        return ((e: any) => {
          const load = Date.now();
          console.log('loading: ', load - loadStartAt, 'ms');
          this.body = e.target.result;
          try {
            this.validate();
          } catch (e) {
            reject(e);
          }

          resolve('ok');
        });
      })(file);
      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
