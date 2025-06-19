import React from 'react';
import {useStore} from './store/store';
import CreateRegisterScreen from './components/CreateRegisterScreen';
import MaterialTopTabsNavigator from './layout/navigation/MaterialTopTabsNavigation';
import AppNavigator from './layout/navigation/AppNavigator';

const MainApp = () => {
  const {registers} = useStore();

  // Check if registers array is empty
  const hasRegisters = Object.keys(registers).length > 0;

  // If no registers exist, show the CreateRegister screen
  if (!hasRegisters) {
    return <CreateRegisterScreen />;
  }

  return <AppNavigator />;
};

export default MainApp;
