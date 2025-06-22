import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Keyboard,
  ToastAndroid,
} from 'react-native';
import useStore from '../../store/store';

// Import version from package.json
const packageJson = require('../../../package.json');

const SettingsScreen: React.FC = () => {
  const {defaultTargetPercentage, registers, activeRegister, setDefaultTargetPercentage, updateAllRegistersTargetPercentage} = useStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [appVersion, setAppVersion] = useState(packageJson.version);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTargetValue, setNewTargetValue] = useState(defaultTargetPercentage.toString());

  useEffect(() => {
    // Set app version from package.json
    setAppVersion(packageJson.version);
    // Update local state when store value changes
    setNewTargetValue(defaultTargetPercentage.toString());
  }, [defaultTargetPercentage]);

  const handleTargetPercentagePress = () => {
    setNewTargetValue(defaultTargetPercentage.toString());
    setShowTargetModal(true);
  };

  const handleTargetValueChange = (text: string) => {
    setNewTargetValue(text);
    // Close keyboard after 2 digits are entered
    if (text.length === 2) {
      Keyboard.dismiss();
    }
  };

  const handleSaveTargetPercentage = () => {
    const percentage = parseInt(newTargetValue);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      Alert.alert('Invalid Input', 'Please enter a valid percentage between 1 and 100.');
      return;
    }

    // Update the global default target percentage
    setDefaultTargetPercentage(percentage);

    // Update all cards in ALL registers
    updateAllRegistersTargetPercentage(percentage);

    setShowTargetModal(false);

    ToastAndroid.show(
      `Default target percentage set to ${percentage}%`,
      ToastAndroid.SHORT,
    );
  };

  const handleCancelTargetChange = () => {
    setNewTargetValue(defaultTargetPercentage.toString());
    setShowTargetModal(false);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all attendance data? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implementation to clear data would go here
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ],
    );
  };

  const exportData = () => {
    Alert.alert('Export Data', 'Export your attendance data to CSV format?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Export',
        onPress: () => {
          // Implementation to export data would go here
          Alert.alert('Success', 'Data exported successfully!');
        },
      },
    ]);
  };

  const getCurrentRegisterInfo = () => {
    const currentRegister = registers[activeRegister];
    return {
      name: currentRegister?.name || 'Unknown',
      totalCards: currentRegister?.cards?.length || 0,
    };
  };

  const registerInfo = getCurrentRegisterInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/icons/navigation/settings.png')}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>Settings</Text>
        </View>

        {/* Current Register Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current Register</Text>
          <Text style={styles.infoValue}>{registerInfo.name}</Text>
          <Text style={styles.infoSubtext}>
            {registerInfo.totalCards} subjects
          </Text>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleTargetPercentagePress}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Target Percentage</Text>
              <Text style={styles.settingDescription}>
                Set for ALL subjects in ALL registers
              </Text>
            </View>
            <View style={styles.targetValueContainer}>
              <Text style={styles.settingValue}>{defaultTargetPercentage}%</Text>
              <Text style={styles.editHint}>Tap</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme throughout the app
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{false: '#767577', true: '#4CAF50'}}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Get reminders about attendance
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{false: '#767577', true: '#4CAF50'}}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Backup</Text>
              <Text style={styles.settingDescription}>
                Automatically backup data locally
              </Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{false: '#767577', true: '#4CAF50'}}
              thumbColor={autoBackup ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Text style={styles.actionButtonText}>Export Data</Text>
            <Text style={styles.actionButtonDescription}>
              Export your attendance data to CSV
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={clearAllData}>
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Clear All Data
            </Text>
            <Text style={styles.actionButtonDescription}>
              Remove all attendance records
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
        </View>
      </View>

      {/* Target Percentage Modal */}
      <Modal
        visible={showTargetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelTargetChange}>
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
                onPress={handleCancelTargetChange}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTargetPercentage}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 70, // Add extra bottom padding to avoid navigation panel overlap
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
    color: '#f5f5f5',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  actionButton: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
    marginBottom: 50, // Increased from 30 to provide more space above navigation
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
});

export default SettingsScreen;
