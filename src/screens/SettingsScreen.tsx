import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import useStore from '../store/store';
import {TextInput} from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

const SettingsScreen: React.FC = () => {
  // ...existing code...
  const {registers, setRegisters} = useStore();
  const [userID, setUserID] = useState<string>('');
  const [register_no, setRegisterNo] = useState<number>(0);

  const [googleUser, setGoogleUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );
  const sendUserDataToFirestore = async (user: FirebaseAuthTypes.User) => {
    try {
      await firestore().collection('users').doc(user.uid).set({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error('Error sending user data to Firestore: ', error);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      await GoogleSignin.signIn();
      const {idToken} = await GoogleSignin.getTokens();

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      setGoogleUser(userCredential.user);
      Alert.alert('Signed in with Google!');
      sendUserDataToFirestore(userCredential.user);
    } catch (error) {
      console.log('Google Sign-In Error', JSON.stringify(error, null, 2));
      Alert.alert('Google Sign-In Error: ' + error);
    }
  };

  const handleInputChange = (value: number) => {
    setRegisterNo(Math.min(Object.keys(registers).length - 1, value));
  };

  const handleSyncData = async () => {
    if (googleUser) {
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(googleUser.uid)
          .get();
        const userData = userDoc.data();
        console.log('User data: ', userData);
        const cardsData = registers[0].cards.slice(0, 8);
        cardsData.forEach(card => {
          console.log('Card: ', card.title);
        });
        await firestore()
          .collection('registers')
          .doc(googleUser.uid)
          .set({
            cards: registers[0].cards.slice(0, 10),
          });
        Alert.alert('Data synced successfully!');
      } catch (error) {
        console.error('Error syncing data: ', error);
        Alert.alert('Error syncing data: ' + error);
      }
    }
  };
  const handleSyncDownload = async (uid: string, register_num: number) => {
    if (googleUser) {
      try {
        const userDoc = await firestore()
          .collection('registers')
          .doc(uid)
          .get();
        const cardData = userDoc.data()?.cards || [];
        console.log('Card data: ', cardData);

        setRegisters(register_num, cardData);
        Alert.alert('Data synced successfully!');
      } catch (error) {
        console.error('Error syncing data: ', error);
        Alert.alert('Error syncing data: ' + error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      setGoogleUser(null);
      Alert.alert('Signed out successfully!');
    } catch (error) {
      Alert.alert('Sign-Out Error: ' + error);
    }
  };
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied to clipboard!');
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer2}>
        <View style={styles.settingsBox}>
          <Image
            source={require('../assets/icons/navigation/settings.png')}
            style={styles.iconsStyle}
          />

          <Text style={styles.settingsText}>Settings</Text>
        </View>
      </View>

      {/* ...existing code... */}
      {googleUser ? (
        <View>
          <Text style={styles.inputStyles}>
            Welcome, {googleUser.displayName}!
          </Text>
          <TouchableOpacity onPress={() => copyToClipboard(googleUser.uid)}>
            <Text style={styles.inputStyles}>User Id, {googleUser.uid}</Text>
          </TouchableOpacity>
          <Button title="Sign Out from Google" onPress={handleSignOut} />
          <Button title="Sync Data" onPress={handleSyncData} />

          <Text style={styles.inputStyles}>Copy From user,</Text>
          <TextInput
            placeholder="User Id"
            value={userID}
            onChangeText={text => setUserID(text)}
            style={styles.inputStyles}
          />
          <TextInput
            placeholder="Register No"
            value={register_no.toString()}
            keyboardType="numeric"
            onChangeText={text => handleInputChange(Number(text) || 0)}
            style={styles.inputStyles}
          />

          <Button
            title="Sync Data"
            onPress={() => handleSyncDownload(userID, register_no)}
          />
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Button title="Sign In with Google" onPress={handleGoogleSignIn} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    padding: 20,
    justifyContent: 'flex-start',
  },
  contentContainer2: {
    marginTop: 20,
    alignItems: 'center',
  },
  settingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
    width: '100%',
  },
  iconsStyle: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  settingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5f5',
  },
  inputStyles: {
    backgroundColor: '#fff',
    borderColor: '#e1e1e1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    width: '100%',
    fontSize: 16,
    color: '#333',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonStyle: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default SettingsScreen;
