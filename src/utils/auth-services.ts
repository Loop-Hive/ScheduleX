import {firestore, auth} from '../firebaseConfig';
// Sign up user
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out user
export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

export const importData = async (collectionName: string, data: object[]) => {
  try {
    const batch = firestore().batch();
    data.forEach((item: object) => {
      const docRef = firestore().collection(collectionName).doc();
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

export const exportData = async (collectionName: string) => {
  try {
    const snapshot = await firestore().collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    console.log('Data exported successfully:', data);
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
  }
};
