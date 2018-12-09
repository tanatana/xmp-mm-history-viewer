import * as XMLParse from 'xml-parser';

export const ErrNotValidXMPMetadata = 'not valid XMP metadata';
export const ErrNotValidXMPHistory = 'not valid XMP history';
export const ErrNotValidResourceEvent = 'not valid resource event';

export interface Metadata {
  dcFormat: string;

  xmpCreateDate: Date;
  xmpModifyDate: Date;
  xmpMetadataDate: Date;

  xmpMMDocumentID: string;
  xmpMMHistory: Array<MetadataHistory>;
  xmpMMInstanceID: string;
  xmpMMOriginalDocumentID: string;
}

export interface MetadataHistory {
  Action: string;
  InstanceID: string;
  When: Date;
  SoftwareAgent: string;
}

function iso8601ToDate(dateString: string): Date {
  const ptime = Date.parse(dateString);
  return new Date(ptime);
}

function xmlNodeToMetadataHistory(node: XMLParse.Node): MetadataHistory {
  console.log(node);
  let action: string;
  let instanceID: string;
  let whenStr: string;
  let softwareAgent: string;
  let parameters: string;

  if (node.name === 'rdf:li') {
      node.children.forEach((v) => {
      console.log(v);
      switch (v.name) {
        case 'stEvt:action':
          action = v.content;
          break;
        case 'stEvt:instanceID':
          instanceID = v.content;
          break;
        case 'stEvt:when':
          whenStr = v.content;
          break;
        case 'stEvt:softwareAgent':
          softwareAgent = v.content;
          break;
        case 'stEvent:parameters':
          parameters = v.content;
      }
    });
  } else {
    action = node.attributes['stEvt:action'];
    instanceID = node.attributes['stEvt:instanceID'];
    whenStr = node.attributes['stEvt:when'];
    softwareAgent = node.attributes['stEvt:softwareAgent'];
    parameters = node.attributes['stEvt:parameters'];
  }

  console.log(action);
  if (
    action === undefined || action === ''
  ) {
    throw (new Error(ErrNotValidResourceEvent));
  }

  const h = {
    Action: action,
    InstanceID: instanceID,
    When: iso8601ToDate(whenStr),
    SoftwareAgent: softwareAgent,
    Parameters: parameters,
  };

  return h;
}

function metadataHistoriesFromXMPMMHistory(node: XMLParse.Node): Array<MetadataHistory> {
  if (node.name !== 'xmpMM:History') {
    throw (new Error(ErrNotValidXMPHistory));
  }
  if (node.children.length !== 1 || node.children[0].name !== 'rdf:Seq') {
    throw (new Error(ErrNotValidXMPHistory));
  }

  const seq = node.children[0].children;
  return seq.map((history: XMLParse.Node): MetadataHistory => {
    return xmlNodeToMetadataHistory(history);
  });

}

export function ParseXMPMetadata(xmlString: string): Metadata {
  const xmlFile = XMLParse(xmlString);
  console.log(xmlFile);
  if (xmlFile.root.name !== 'x:xmpmeta' || xmlFile.root.attributes['xmlns:x'] !== 'adobe:ns:meta/') {
    throw (new Error(ErrNotValidXMPMetadata));
  }

  const rdf = xmlFile.root.children[0];
  if (rdf.name !== 'rdf:RDF' || rdf.attributes['xmlns:rdf'] !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#') {
    throw (new Error(ErrNotValidXMPMetadata));
  }

  const rdfDescription = rdf.children[0];
  if (rdfDescription.name !== 'rdf:Description') {
    throw (new Error(ErrNotValidXMPMetadata));
  }
  console.log('description:', rdfDescription);

  const metadata: Metadata = {
    dcFormat: '',
    xmpCreateDate: new Date(),
    xmpModifyDate: new Date(),
    xmpMetadataDate: new Date(),
    xmpMMDocumentID: '',
    xmpMMHistory: [],
    xmpMMInstanceID: '',
    xmpMMOriginalDocumentID: '',
  };
  rdfDescription.children.forEach((node) => {
    switch (node.name) {
      case 'dc:format':
        metadata.dcFormat = node.content;
        break;
      case 'xmp:CreateDate':
        metadata.xmpCreateDate = iso8601ToDate(node.content);
        break;
      case 'xmp:ModifyDate':
        metadata.xmpModifyDate = iso8601ToDate(node.content);
        break;
      case 'xmp:MetadataDate':
        metadata.xmpMetadataDate = iso8601ToDate(node.content);
        break;
      case 'xmpMM:DocumentID':
        metadata.xmpMMDocumentID = node.content;
        break;
      case 'xmpMM:History':
        metadata.xmpMMHistory = metadataHistoriesFromXMPMMHistory(node);
        break;
      case 'xmpMM:InstanceID':
        metadata.xmpMMInstanceID = node.content;
        break;
      case 'xmpMM:OriginalDocumentID':
        metadata.xmpMMOriginalDocumentID = node.content;
        break;
    }

  });

  return metadata;
}
