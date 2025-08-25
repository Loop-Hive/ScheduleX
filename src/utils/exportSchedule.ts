import RNFS from 'react-native-fs';
import { Alert, ToastAndroid, Platform, PermissionsAndroid } from 'react-native';
import Share from 'react-native-share';
import { generateRegisterCSV } from './csv-export';
import { CardInterface } from '../types/cards';
import { PermissionsHelper } from './permissions';

export interface ExportResult {
  path: string;
  fileName: string;
  exists: boolean;
}

export interface ExportUtilityProps {
  selectedRegisters: number[];
  registers: { [key: number]: { name: string; cards: CardInterface[] } };
}

export class ExportScheduleUtility {
  private selectedRegisters: number[];
  private registers: { [key: number]: { name: string; cards: CardInterface[] } };

  constructor({ selectedRegisters, registers }: ExportUtilityProps) {
    this.selectedRegisters = selectedRegisters;
    this.registers = registers;
  }

  private async checkStoragePermission(): Promise<boolean> {
    // Use PermissionsHelper for consistent permission logic
    const result = await PermissionsHelper.requestStoragePermission();
    return result.granted;
  }

  private getAllRegisterIds(): number[] {
    return Object.keys(this.registers).map(key => parseInt(key, 10));
  }

  private async exportSelectedRegistersCSV(checkOnly = false, overwrite = false, customFileName?: string): Promise<ExportResult | null> {
    try {
      console.log('Starting export with selectedRegisters:', this.selectedRegisters);
      console.log('Available registers:', Object.keys(this.registers));
      
  // No permission needed for app-specific external storage on Android 13+
      
      if (this.selectedRegisters.length === 0) {
        Alert.alert('Export Failed', 'No registers selected for export.');
        return null;
      }

      let fileName = '';
      let csv = '';
      const registerList = this.selectedRegisters.map(registerIdx => {
        const register = this.registers[registerIdx];
        console.log(`Register ${registerIdx}:`, register);
        return register ? { name: register.name, cards: register.cards || [] } : null;
      }).filter(Boolean) as { name: string, cards: CardInterface[] }[];

      console.log('Register list for export:', registerList);

      if (registerList.length === 0) {
        Alert.alert('Export Failed', 'No valid registers found for export.');
        return null;
      }

      if (customFileName && customFileName.trim().length > 0) {
        fileName = customFileName.endsWith('.csv') ? customFileName : `${customFileName}.csv`;
      } else if (registerList.length === 1) {
        fileName = `TimeTable_${registerList[0].name.replace(/\s+/g, '_')}.csv`;
      } else if (registerList.length === this.getAllRegisterIds().length) {
        fileName = `TimeTable_Grouped_All.csv`;
      } else {
        fileName = `TimeTable_Grouped_${registerList.length}.csv`;
      }

      console.log('Generating CSV for filename:', fileName);
      csv = generateRegisterCSV(registerList);
      console.log('CSV generated, length:', csv.length);
      
      if (!csv || csv.trim().length === 0) {
        Alert.alert('Export Failed', 'No schedule data found to export.');
        return null;
      }

      // WhatsApp-like: Save in Android/media/com.schedulex/ScheduleX
      console.log('RNFS.ExternalStorageDirectoryPath:', RNFS.ExternalStorageDirectoryPath);
      const scheduleXDir = `${RNFS.ExternalStorageDirectoryPath}/Android/media/com.schedulex/ScheduleX`;
      const dirExists = await RNFS.exists(scheduleXDir);
      if (!dirExists) {
        try {
          await RNFS.mkdir(scheduleXDir);
          console.log('Created folder:', scheduleXDir);
        } catch (e) {
          console.error('Error creating folder:', e);
        }
      }
      const path = `${scheduleXDir}/${fileName}`;
      console.log('Export path:', path);
      const exists = await RNFS.exists(path);

      if (checkOnly && exists) {
        return { path, fileName, exists: true };
      }

      if (!exists || overwrite) {
        await RNFS.writeFile(path, csv, 'utf8');
        return { path, fileName, exists: false };
      }

      if (!checkOnly && exists && !overwrite) {
        return { path, fileName, exists: true };
      }

      return null;
    } catch (e) {
      console.error('Export error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      Alert.alert('Export Failed', `Could not export CSV: ${errorMessage}`);
      return null;
    }
  }

  async saveToDevice(customFileName?: string): Promise<void> {
    const result = await this.exportSelectedRegistersCSV(true, false, customFileName); // pass checkOnly flag
    if (result && result.exists) {
      Alert.alert(
        'File Exists',
        `File already exists as ${result.fileName}. Download again?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: async () => {
              await this.exportSelectedRegistersCSV(false, true, customFileName); // force overwrite
              ToastAndroid.show(
              `Saved: ${result.fileName}\nPath: ${result.path}`,
              ToastAndroid.LONG
            );
            }
          }
        ]
      );
    } else if (result) {
      ToastAndroid.show(
        `Saved to Storage: ${result.fileName}`,
        ToastAndroid.SHORT
      );
    }
  }

  async shareSchedule(): Promise<void> {
    const result = await this.exportSelectedRegistersCSV();
    if (result) {
      const shareOptions = {
        title: 'Share Time Table',
        url: 'file://' + result.path,
        type: 'text/csv',
      };
      try {
        await Share.open(shareOptions);
      } catch (e) {
        // User cancelled sharing or error occurred
      }
    }
  }
}

// Convenience functions for direct use
export const saveScheduleToDevice = async ({ selectedRegisters, registers }: ExportUtilityProps): Promise<void> => {
  const exportUtil = new ExportScheduleUtility({ selectedRegisters, registers });
  await exportUtil.saveToDevice();
};

// Overload to support custom filename
export const saveScheduleToDeviceWithName = async (
  { selectedRegisters, registers }: ExportUtilityProps,
  customFileName: string
): Promise<void> => {
  const exportUtil = new ExportScheduleUtility({ selectedRegisters, registers });
  await exportUtil.saveToDevice(customFileName);
};

export const shareSchedule = async ({ selectedRegisters, registers }: ExportUtilityProps): Promise<void> => {
  const exportUtil = new ExportScheduleUtility({ selectedRegisters, registers });
  await exportUtil.shareSchedule();
};
