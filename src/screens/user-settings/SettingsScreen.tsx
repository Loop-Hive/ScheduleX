// src/screens/user-settings/SettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  FlatList,
  Alert,
  TextInput,
  Modal,
  Keyboard,
  ToastAndroid,
  Button,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSelect from 'react-native-multiple-select';
import useStore from '../../store/store';
import { saveScheduleToDevice, shareSchedule, saveScheduleToDeviceWithName } from '../../utils/exportSchedule';
import pickCSVFile, { pickCSVFileRaw } from '../../utils/csv-picker';
import { importAndAddToRegisterFromContent } from '../../utils/csv-import';

// Constants
const packageJson = require('../../../package.json');
const scheduleOptions = [
  { id: 'morning', name: 'Morning Routine' },
  { id: 'evening', name: 'Evening Routine' },
  { id: 'default', name: 'Default' },
  { id: 'all', name: 'All Schedules' },
];

const SettingsScreen: React.FC = () => {
  // State and Store
  const {
    defaultTargetPercentage,
    registers,
    activeRegister,
    selectedRegisters,
    viewingRegisters,
    setViewingRegisters,
    setDefaultTargetPercentage,
    updateAllRegistersTargetPercentage,
    selectedSchedules,
    setSelectedSchedules,
    notificationLeadTime,
    setNotificationLeadTime,
    addMultipleCards,
  } = useStore();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [appVersion, setAppVersion] = useState(packageJson.version);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTargetValue, setNewTargetValue] = useState(defaultTargetPercentage.toString());
  const [localLeadTime, setLocalLeadTime] = useState(notificationLeadTime);
  const [localSchedules, setLocalSchedules] = useState<string[]>(selectedSchedules);
  // CSV filename modal state
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [csvFileName, setCsvFileName] = useState('MySchedule');
  const [isSaving, setIsSaving] = useState(false);

  const registerOptions = Object.keys(registers).map(key => ({
    id: key,
    name: registers[parseInt(key)].name,
  }));
  // Effects
  useEffect(() => {
    setAppVersion(packageJson.version);
    setNewTargetValue(defaultTargetPercentage.toString());
  }, [defaultTargetPercentage]);

  // Handlers
  const handleTargetPercentagePress = () => {
    setNewTargetValue(defaultTargetPercentage.toString());
    setShowTargetModal(true);
  };

  const handleTargetValueChange = (text: string) => {
    setNewTargetValue(text);
    if (text.length === 2) Keyboard.dismiss();
  };

  const handleSaveTargetPercentage = () => {
    const percentage = parseInt(newTargetValue);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      Alert.alert('Invalid Input', 'Please enter a valid percentage between 1 and 100.');
      return;
    }
    setDefaultTargetPercentage(percentage);
    updateAllRegistersTargetPercentage(percentage);
    setShowTargetModal(false);
    ToastAndroid.show(`Default target percentage set to ${percentage}%`, ToastAndroid.SHORT);
  };

  const handleCancelTargetChange = () => {
    setNewTargetValue(defaultTargetPercentage.toString());
    setShowTargetModal(false);
  };

  const handleSave = () => {
    setNotificationLeadTime(localLeadTime);
    setSelectedSchedules(localSchedules);
    const selectedNames = scheduleOptions
      .filter((s) => localSchedules.includes(s.id))
      .map((s) => s.name)
      .join(', ') || 'None';
    Alert.alert(
      'Settings Saved',
      `You will be reminded ${localLeadTime} minutes before class for: ${selectedNames}`,
    );
  };

  // Export functionality handlers
  // Show modal to enter filename
  const handleSaveScheduleToDevice = () => {
    setShowFileNameModal(true);
  };

  // Actually save with filename
  const handleConfirmSaveFileName = async () => {
    setIsSaving(true);
    try {
      const currentSelectedRegisters = selectedRegisters && selectedRegisters.length > 0
        ? selectedRegisters
        : Object.keys(registers).map(key => parseInt(key, 10));
      if (currentSelectedRegisters.length === 0) {
        Alert.alert('No Data', 'No registers found to export. Please create some schedules first.');
        setIsSaving(false);
        return;
      }
      await saveScheduleToDeviceWithName({
        selectedRegisters: currentSelectedRegisters,
        registers
      }, csvFileName);
      setShowFileNameModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save schedule to device: ${errorMessage}`);
    }
    setIsSaving(false);
  };

  const handleShareSchedule = async () => {
    try {
      console.log('Starting share schedule...');
      console.log('Available registers:', Object.keys(registers));
      console.log('Selected registers from store:', selectedRegisters);

      // Use all registers if no specific selection is available
      const currentSelectedRegisters = selectedRegisters && selectedRegisters.length > 0
        ? selectedRegisters
        : Object.keys(registers).map(key => parseInt(key, 10));

      console.log('Using registers for share:', currentSelectedRegisters);

      if (currentSelectedRegisters.length === 0) {
        Alert.alert('No Data', 'No registers found to share. Please create some schedules first.');
        return;
      }

      await shareSchedule({
        selectedRegisters: currentSelectedRegisters,
        registers
      });
    } catch (error) {
      console.error('Share schedule error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to share schedule: ${errorMessage}`);
    }
  };

  const handleImportSchedule = async () => {
    try {
      console.log('Starting CSV import...');

      if (!registers[activeRegister]) {
        Alert.alert('Error', 'No active register found. Please create a register first.');
        return;
      }

      // Use raw CSV content instead of parsed data
      const csvContent = await pickCSVFileRaw();
      console.log('Raw CSV Content received:', csvContent);

      if (!csvContent) {
        console.log('No CSV content received (user cancelled or error)');
        return;
      }

      // Use the import utility with the current active register
      const currentCards = registers[activeRegister]?.cards || [];
      await importAndAddToRegisterFromContent(
        csvContent,
        activeRegister,
        currentCards,
        addMultipleCards
      );

    } catch (error) {
      console.error('Import schedule error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to import schedule: ${errorMessage}`);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all attendance data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'All data has been cleared.'),
        },
      ],
    );
  };

  const getCurrentRegisterInfo = () => {
    const currentRegister = registers[activeRegister];
    return {
      name: currentRegister?.name || 'Unknown',
      totalCards: currentRegister?.cards?.length || 0,
    };
  };

  const registerInfo = getCurrentRegisterInfo();

  // Render Item for FlatList
  const renderSettings = () => (
    <View style={styles.contentContainer}>
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/icons/navigation/settings.png')}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>Settings</Text>
        </View>
      </View>

      {/* Current Register Info */}
      <View style={styles.card}>
        <Text style={styles.infoTitle}>Current Register</Text>
        <Text style={styles.infoValue}>{registerInfo.name}</Text>
        <Text style={styles.infoSubtext}>{registerInfo.totalCards} subjects</Text>
      </View>
      {/* Preferences Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleTargetPercentagePress}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Target Percentage</Text>
            <Text style={styles.settingDescription}>Set for ALL subjects in ALL registers</Text>
          </View>
          <View style={styles.targetValueContainer}>
            <Text style={styles.settingValue}>{defaultTargetPercentage}%</Text>
            <Text style={styles.editHint}>Tap</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Get reminders about attendance</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Backup</Text>
            <Text style={styles.settingDescription}>Automatically backup data locally</Text>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={autoBackup ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>


      {/* Notifications & Alerts Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications & Alerts</Text>

        <Text style={styles.settingLabel}>Select Schedules for Alerts</Text>
        <MultiSelect
          items={scheduleOptions}
          uniqueKey="id"
          onSelectedItemsChange={setLocalSchedules}
          selectedItems={localSchedules}
          selectText="Pick Schedules"
          searchInputPlaceholderText="Search Schedules..."
          tagRemoveIconColor="#EF4444"
          tagTextColor="#9a4848ff"
          selectedItemTextColor="#4CAF50"
          selectedItemIconColor="#4CAF50"
          itemTextColor="#bb5656ff"
          displayKey="name"
          searchInputStyle={{ color: '#e23939ff' }}
          submitButtonColor="#4CAF50"
          submitButtonText="Apply"
          styleMainWrapper={{ backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginVertical: 10 }}
        />

        <View style={styles.sliderContainer}>
          <Text style={[styles.settingLabel, { marginBottom: 16 }]}>
            Notify Before: {localLeadTime} minute{localLeadTime !== 1 ? 's' : ''}
          </Text>
          <Slider
            minimumValue={5}
            maximumValue={60}
            step={5}
            value={localLeadTime}
            onValueChange={setLocalLeadTime}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#71717A"
            thumbTintColor="#4CAF50"
            style={{ height: 40 }}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
      {/* Utilities Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Utilities</Text>

        <TouchableOpacity style={styles.utilityButton} onPress={handleSaveScheduleToDevice}>
          <View style={styles.utilityButtonContent}>
            <Image
              source={require('../../assets/icons/save.png')}
              style={styles.utilityIcon}
            />
            <View style={styles.utilityTextContainer}>
              <Text style={styles.utilityButtonText}>Save Schedule to Device</Text>
              <Text style={styles.utilityButtonDescription}>Save your schedule to Device</Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* CSV Filename Modal */}
        <Modal
          visible={showFileNameModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFileNameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Enter CSV Filename</Text>
              <Text style={styles.modalSubtitle}>This will be the name of your exported CSV file.</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={csvFileName}
                  onChangeText={setCsvFileName}
                  placeholder="Enter filename"
                  placeholderTextColor="#71717A"
                  maxLength={40}
                  selectTextOnFocus={true}
                  autoFocus={true}
                />
                <Text style={styles.percentSymbol}>.csv</Text>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowFileNameModal(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleConfirmSaveFileName}
                  disabled={isSaving || !csvFileName.trim()}
                >
                  <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.utilityButton} onPress={handleShareSchedule}>
          <View style={styles.utilityButtonContent}>
            <Image
              source={require('../../assets/icons/share.png')}
              style={styles.utilityIcon}
            />
            <View style={styles.utilityTextContainer}>
              <Text style={styles.utilityButtonText}>Share Schedule</Text>
              <Text style={styles.utilityButtonDescription}>Share your schedule via apps</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.utilityButton} onPress={handleImportSchedule}>
          <View style={styles.utilityButtonContent}>
            <Image
              source={require('../../assets/icons/export.png')}
              style={styles.utilityIcon}
            />
            <View style={styles.utilityTextContainer}>
              <Text style={styles.utilityButtonText}>Import Schedule from CSV</Text>
              <Text style={styles.utilityButtonDescription}>Import subjects from a CSV file</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllData}>
          <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          <Text style={styles.actionButtonDescription}>Remove all attendance records</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
      </View>
    </View>
  );

  // Render
  return (
    <>
      <FlatList
        data={[{}]} // Single item to render the entire settings UI
        renderItem={renderSettings}
        keyExtractor={() => 'settings'}
        style={styles.container}
      />
      {/* Target Percentage Modal */}
      <Modal
        visible={showTargetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelTargetChange}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Default Target Percentage</Text>
            <Text style={styles.modalSubtitle}>
              This will update the target percentage for ALL subjects in ALL registers
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newTargetValue}
                onChangeText={handleTargetValueChange}
                keyboardType="numeric"
                placeholder="Enter percentage"
                placeholderTextColor="#71717A"
                maxLength={3}
                selectTextOnFocus={true}
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelTargetChange}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTargetPercentage}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B', // fallback for gradient
    // For gradient, use a wrapper View with a gradient component in JSX if needed
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
    paddingTop: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 0,
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: '#f5f5f5',
  },
  headerText: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#f5f5f5',
  letterSpacing: 0.7,
  },
  infoCard: {
    backgroundColor: '#27272A',
    borderRadius: 18,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#895656ff',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#71717A',
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F5F5',
    marginBottom: 20,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  actionButton: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  dangerButton: {
    borderColor: '#DC2626',
    backgroundColor: '#1F1F23',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  dangerText: {
    color: '#EF4444',
  },
  actionButtonDescription: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  infoSection: {
    marginBottom: 50,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 16,
    color: '#A1A1AA',
  },
  targetValueContainer: {
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 2,
  },
  editHint: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 28,
    width: '88%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f5f5f5',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#f5f5f5',
    textAlign: 'center',
  },
  percentSymbol: {
    fontSize: 18,
    color: '#A1A1AA',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3F3F46',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Utility button styles
  utilityButton: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  utilityButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilityIcon: {
    width: 28,
    height: 28,
    marginRight: 16,
    tintColor: '#8B5CF6',
  },
  utilityTextContainer: {
    flex: 1,
  },
  utilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  utilityButtonDescription: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  card: {
  backgroundColor: '#232323',
  borderRadius: 22,
  padding: 28,
  marginBottom: 36,
  borderWidth: 1,
  borderColor: '#3F3F46',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  elevation: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
});
export default SettingsScreen;