import React, {useRef} from 'react';
import {View, PanResponder, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

interface SwipeableScreenWrapperProps {
  children: React.ReactNode;
  tabRoutes: string[];
}

type TabParamList = {
  Home: undefined;
  Schedule: undefined;
  Subjects: undefined;
  Tasks: undefined;
};

const {width} = Dimensions.get('window');

const SwipeableScreenWrapper: React.FC<SwipeableScreenWrapperProps> = ({
  children,
  tabRoutes,
}) => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  // Get current route name
  const getCurrentIndex = () => {
    const currentRoute = navigation.getState().routes[navigation.getState().index];
    return tabRoutes.indexOf(currentRoute.name);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes that are significant
        // Also check if the swipe is not starting from the edges (to avoid conflicts with other gestures)
        const {locationX} = evt.nativeEvent;
        const isEdgeSwipe = locationX < 20 || locationX > width - 20;

        return (
          !isEdgeSwipe &&
          Math.abs(gestureState.dx) > 30 &&
          Math.abs(gestureState.dy) < 100 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2
        );
      },
      onPanResponderGrant: () => {
        // Gesture started
      },
      onPanResponderMove: () => {
        // Handle move if needed for visual feedback
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = width * 0.2; // 20% of screen width
        const {dx, vx} = gestureState;
        const currentIndex = getCurrentIndex();

        // Check if swipe is significant enough
        if (Math.abs(dx) > threshold || Math.abs(vx) > 0.5) {
          if (dx > 0 && currentIndex > 0) {
            // Swipe right - go to previous tab
            navigation.navigate(tabRoutes[currentIndex - 1] as keyof TabParamList);
          } else if (dx < 0 && currentIndex < tabRoutes.length - 1) {
            // Swipe left - go to next tab
            navigation.navigate(tabRoutes[currentIndex + 1] as keyof TabParamList);
          }
        }
      },
      onPanResponderTerminate: () => {
        // Gesture was terminated
      },
    }),
  ).current;

  return (
    <View style={{flex: 1}} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default SwipeableScreenWrapper;
