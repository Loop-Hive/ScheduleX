import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import useStore from '../store/store';

const SettingsScreen: React.FC = () => {
  const {defaultTargetPercentage, registers, activeRegister} = useStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

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
            source={require('../assets/icons/navigation/settings.png')}
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
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Default Target</Text>
            <Text style={styles.infoValue}>{defaultTargetPercentage}%</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 30,
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
});

export default SettingsScreen;
