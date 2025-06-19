import React, {useState, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Sidebar from '../../Sidebar';
import TimeTableScreen from '../../../screens/time-table/TimeTableScreen';
import SubjectsScreen from '../../../screens/subjects/SubjectsScreen';

import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import HomeScreen from '../../../screens/home/HomeScreen';
import CardMenu from './CardMenu';
import CustomTabBar from './CustomTabBar';
import SettingsScreen from '../../../screens/user-settings/SettingsScreen';
const {width} = Dimensions.get('window');

type TabParamList = {
  Home: undefined;
  Schedule: undefined;
  Subjects: undefined;
  Settings: undefined;
};
const Tab = createBottomTabNavigator<TabParamList>();

const Tabs: React.FC = ({navigation}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cardId, setCardId] = useState(-1);
  const [registerId, setRegisterId] = useState(-1);
  const [isChange, setIsChange] = useState(false);

  const sidebarTranslate = useRef(new Animated.Value(-width * 0.76)).current;

  const renderCustomTabBar = (props: any) => <CustomTabBar {...props} />;

  const CloseCardMenu = () => {
    setRegisterId(-1);
    setCardId(-1);
    setIsMenuOpen(false);
  };
  const handleMenuOpen = (RegisterId: number, CardId: number) => {
    setCardId(CardId);
    setRegisterId(RegisterId);
    setIsMenuOpen(true);
  };

  const openSidebar = () => {
    Animated.spring(sidebarTranslate, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(true);
    });
  };

  const closeSidebar = () => {
    Animated.spring(sidebarTranslate, {
      toValue: -width * 0.76,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          sidebarTranslate.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -width * 0.1) {
          closeSidebar();
        } else {
          openSidebar();
        }
      },
    }),
  ).current;

  const overlayOpacity = sidebarTranslate.interpolate({
    inputRange: [-width * 0.76, 0],
    outputRange: [0, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={renderCustomTabBar}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            paddingBottom: 0, // Remove extra padding
          },
        }}>
        <Tab.Screen name="Home">
          {props => (
            <HomeScreen
              {...props}
              toggleSidebar={openSidebar}
              handleMenuOpen={handleMenuOpen}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Schedule">
          {props => (
            <TimeTableScreen {...props} handleMenuOpen={handleMenuOpen} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Subjects">
          {props => (
            <SubjectsScreen
              {...props}
              toggleSidebar={openSidebar}
              handleMenuOpen={handleMenuOpen}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Settings">{props => <SettingsScreen />}</Tab.Screen>
      </Tab.Navigator>
      {/* SIDEBAR  */}
      <Animated.View
        style={[styles.overlay, {opacity: overlayOpacity}]}
        pointerEvents={isOpen ? 'auto' : 'none'}>
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={closeSidebar}
        />
      </Animated.View>
      <Animated.View
        style={[styles.sidebar, {transform: [{translateX: sidebarTranslate}]}]}
        {...panResponder.panHandlers}>
        <Sidebar />
      </Animated.View>
      {/* card menu  */}

      <CardMenu
        isVisible={isMenuOpen}
        onClose={CloseCardMenu}
        RegisterId={registerId}
        CardId={cardId}
        navigation={navigation}
        makeChange={() => setIsChange(!isChange)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.76,
    maxWidth: width * 1,
    backgroundColor: '#18181B',
    padding: 20,
    borderRightWidth: 1,
    borderColor: '#252525',
    zIndex: 10000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
export default Tabs;
