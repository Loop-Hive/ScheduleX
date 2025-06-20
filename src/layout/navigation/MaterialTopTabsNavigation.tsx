import React from 'react';
import {StyleSheet} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import TasksScreen from '../../screens/tasks-chat/TasksScreen';
import Tabs from './Tabs/Tabs';
const Tab = createMaterialTopTabNavigator();

const MaterialTopTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        tabBarStyle: {
          height: 0,
          opacity: 0,
          display: 'none',
        },
        swipeEnabled: false, // Disable swipe to prevent interference with day tabs scrolling
        animationEnabled: true,
      }}>
      <Tab.Screen
        name="Tabs"
        component={Tabs}
        options={{
          tabBarLabel: 'Tabs',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
});

export default MaterialTopTabsNavigator;
