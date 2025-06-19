import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useStore} from '../store/store';

const CreateRegisterScreen = () => {
  const [registerName, setRegisterName] = useState('');
  const {addRegister, setActiveRegister, registers} = useStore();

  const handleCreateRegister = () => {
    if (!registerName.trim()) {
      Alert.alert('Error', 'Please enter a register name');
      return;
    }

    // Find the next available register ID
    const newRegisterId = Object.keys(registers).length;
    addRegister(newRegisterId, registerName.trim());
    setActiveRegister(newRegisterId);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Attendance AI</Text>
          <Text style={styles.subtitle}>
            Let's get started by creating your first register
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Register Name</Text>
          <TextInput
            style={styles.input}
            value={registerName}
            onChangeText={setRegisterName}
            placeholder="e.g., Semester VI, Class 10A, etc."
            placeholderTextColor="#666"
            autoCapitalize="words"
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.createButton,
              !registerName.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleCreateRegister}
            disabled={!registerName.trim()}>
            <Text style={styles.createButtonText}>Create Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can add subjects and track attendance after creating your first
            register
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3F3F46',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#374151',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CreateRegisterScreen;
