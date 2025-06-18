import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Tabs from './Tabs/Tabs';
import AddCard from './screens/AddCard';
import EditCard from './screens/EditCard';
import ViewCardDetails from './screens/ViewCardDetails';
import AiScreen from './screens/AiScreen';
import CreateRegisterScreen from './screens/CreateRegisterScreen';
import {useStore} from './store/store';

type RootStackParamList = {
  Tab: undefined;
  Add: undefined;
  Edit: {card_register: number; card_id: number};
  CardDetails: {card_register: number; card_id: number};
  Ai: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainApp = () => {
  const {registers} = useStore();

  // Check if registers array is empty
  const hasRegisters = Object.keys(registers).length > 0;

  // If no registers exist, show the CreateRegister screen
  if (!hasRegisters) {
    return <CreateRegisterScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#18181B',
        }}>
        <Stack.Screen
          name="Tab"
          component={Tabs}
          // options={{animation: 'slide_from_bottom'}}
        />

        <Stack.Screen
          name="Add"
          component={AddCard}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="Edit"
          component={EditCard}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="CardDetails"
          component={ViewCardDetails}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="Ai"
          component={AiScreen}
          options={{animation: 'slide_from_bottom'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainApp;
