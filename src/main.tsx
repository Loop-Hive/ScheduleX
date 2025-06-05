import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Tabs from './Tabs/Tabs';
import AddCard from './screens/AddCard';
import EditCard from './screens/EditCard';
import ViewCardDetails from './screens/ViewCardDetails';

type RootStackParamList = {
  Tab: undefined;
  Add: undefined;
  Edit: {card_register: number; card_id: number};
  CardDetails: {card_register: number; card_id: number};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainApp = ({}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainApp;
