import {pick, types} from '@react-native-documents/picker';
import Papa from 'papaparse';
import RNFS from 'react-native-fs';

const pickCSVFile = async () => {
  let csvdata: any = null; // Initialize csvdata variable

  try {
    const res = await pick({
      allowMultiSelection: false, // Allow multiple file selection
      type: [types.csv],
    });

    // Check if all selected files are of the requested type
    if (!res.every(file => file.hasRequestedType)) {
      console.error('Some selected files are not csv or xls or xlsx.');
      return; // Exit if invalid files are selected
    }

    // Process the selected files
    console.log('Selected files:', res);

    for (const file of res) {
      const fileUri = file.uri;
      console.log('File URI:', fileUri);

      // Read file content using react-native-fs
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      Papa.parse(fileContent, {
        header: true,
        complete: results => {
          console.log('Parsed CSV Data:', results.data);
          csvdata = results.data; // Return the parsed data
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
