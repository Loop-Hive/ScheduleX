import {pick, types} from '@react-native-documents/picker';
import Papa from 'papaparse';
import RNFS from 'react-native-fs';

const pickCSVFile = async () => {
  let csvdata: any = [];
  try {
    const res = await pick({
      allowMultiSelection: false,
      type: [types.csv],
    });
    if (!res.every(file => file.hasRequestedType)) {
      console.error('Some selected files are not csv or xls or xlsx.');
      return;
    }
    for (const file of res) {
      const fileUri = file.uri;
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      Papa.parse(fileContent, {
        header: false, // always parse as raw rows
        skipEmptyLines: true,
        complete: results => {
          console.log('Parsed CSV Data:', results.data);
          csvdata = results.data;
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  } catch (err: any) {
    if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
      console.log('User cancelled the picker');
    } else {
      console.error('Error picking document:', err);
    }
  }
  return csvdata;
};

export default pickCSVFile;
