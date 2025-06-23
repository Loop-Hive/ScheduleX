import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AddCard from '../../screens/add-card/AddCard';
import EditCard from '../../screens/edit-card/EditCard';
import ManageScheduleScreen from '../../screens/edit-schedule/EditScheduleScreen';
import ViewCardDetails from '../../screens/card-metrics/ViewCardDetails';
import AiScreen from '../../screens/generate-ai/AiScreen';
import {NavigationContainer} from '@react-navigation/native';
import MaterialTopTabsNavigator from './MaterialTopTabsNavigation';

export type RootStackParamList = {
  App: undefined;
  Add: undefined;
  Edit: {card_register: number; card_id: number};
  EditSchedule: undefined;
  CardDetails: {card_register: number; card_id: number};
  Ai: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        //   initialRouteName="Tabs"
        screenOptions={{
          headerShown: false,
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#18181B',
        }}>
        <Stack.Screen
          name="App"
          component={MaterialTopTabsNavigator}
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
          name="EditSchedule"
          component={ManageScheduleScreen}
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

export default AppNavigator;
