import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Tabs from './components/Tabs/Tabs';
import AddCard from './screens/add-card/AddCard';
import EditCard from './screens/edit-card/EditCard';
import ViewCardDetails from './screens/card-metrics/ViewCardDetails';
import AiScreen from './screens/generate-ai/AiScreen';
import {useStore} from './store/store';
import CreateRegisterScreen from './components/CreateRegisterScreen';

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
