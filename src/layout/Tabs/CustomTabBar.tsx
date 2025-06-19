import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  HomeIcon,
  ScheduleIcon,
  SubjectIcon,
  // TaskIcon,
  PlusIcon,
  ProfileIcon,
} from '../../assets/icons/navigation/new';
import FloatingActionModal from '../FloatingActionModal';

const {width} = Dimensions.get('window');
const NORMAL_COLOR = '#9CA3AF';
const ACTIVE_COLOR = '#6366F1';

interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar: React.FC<CustomTabBarProps> = ({state, navigation}) => {
  const insets = useSafeAreaInsets();
  const [footerWidth, setFooterWidth] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const plusRotation = useRef(new Animated.Value(0)).current;
  const [indicatorVisible, setIndicatorVisible] = useState(false);

  const INDICATOR_WIDTH = 60;
  const tabWidth = footerWidth / 5; // 5 sections (2 tabs + center space + 2 tabs)
  let offset;
  if (state.index === 0) {
    // Home tab
    offset = state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
  } else if (state.index === 1) {
    // Schedule tab
    offset = state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
  } else if (state.index === 2) {
    // Subjects tab (after center space)
    offset = (state.index + 1) * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
  } else {
    // Tasks tab
    offset = (state.index + 1) * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
  }

  // Handle tab animation
  useEffect(() => {
    if (footerWidth === 0) {
      return;
    }

    if (!indicatorVisible) {
      tabIndicator.setValue(offset);
      setIndicatorVisible(true);
    } else {
      Animated.timing(tabIndicator, {
        toValue: offset,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [state.index, footerWidth, indicatorVisible, offset, tabIndicator]);

  // Handle plus button rotation
  useEffect(() => {
    Animated.timing(plusRotation, {
      toValue: modalVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [modalVisible, plusRotation]);

  const tabRoutes = [
    {name: 'Home', icon: HomeIcon, label: 'Home'},
    {name: 'Schedule', icon: ScheduleIcon, label: 'Schedule'},
    {name: 'Subjects', icon: SubjectIcon, label: 'Subjects'},
    {name: 'Settings', icon: ProfileIcon, label: 'Settings'},
  ];

  const rotateInterpolate = plusRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleTabPress = (routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find(route => route.name === routeName)?.key || '',
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handlePlusPress = () => {
    setModalVisible(!modalVisible);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleAddSubject = () => {
    navigation.navigate('Add');
  };

  const handleAddTask = () => {
    // Navigate to add task screen when implemented
    console.log('Add Task pressed');
  };

  const handleGenerateAI = () => {
    navigation.navigate('Ai');
  };

  const handleImportSubjects = () => {
    // Navigate to import subjects screen when implemented
    console.log('Import Subjects pressed');
  };

  return (
    <>
      <View style={[styles.navigationBar, {paddingBottom: insets.bottom}]}>
        <Animated.View
          style={styles.footer}
          onLayout={event => {
            const {width: layoutWidth} = event.nativeEvent.layout;
            setFooterWidth(layoutWidth);
          }}>
          {/* Indicator */}
          {indicatorVisible && (
            <Animated.View
              style={[
                styles.indicator,
                {
                  transform: [{translateX: tabIndicator}],
                  width: INDICATOR_WIDTH,
                },
              ]}
            />
          )}

          {/* Tab Buttons */}
          {/* Home Tab */}
          <TouchableOpacity
            onPress={() => handleTabPress('Home')}
            style={styles.tabButton}
            activeOpacity={0.7}>
            <View style={styles.tabContent}>
              <HomeIcon
                width={24}
                height={24}
                color={state.index === 0 ? ACTIVE_COLOR : NORMAL_COLOR}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: state.index === 0 ? ACTIVE_COLOR : NORMAL_COLOR},
                ]}>
                Home
              </Text>
            </View>
          </TouchableOpacity>

          {/* Schedule Tab */}
          <TouchableOpacity
            onPress={() => handleTabPress('Schedule')}
            style={styles.tabButton}
            activeOpacity={0.7}>
            <View style={styles.tabContent}>
              <ScheduleIcon
                width={24}
                height={24}
                color={state.index === 1 ? ACTIVE_COLOR : NORMAL_COLOR}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: state.index === 1 ? ACTIVE_COLOR : NORMAL_COLOR},
                ]}>
                Schedule
              </Text>
            </View>
          </TouchableOpacity>

          {/* Center Space for Plus Button */}
          <View style={styles.centerSpace}>
            <View style={styles.centerSpaceFill} />
          </View>

          {/* Subjects Tab */}
          <TouchableOpacity
            onPress={() => handleTabPress('Subjects')}
            style={styles.tabButton}
            activeOpacity={0.7}>
            <View style={styles.tabContent}>
              <SubjectIcon
                width={24}
                height={24}
                color={state.index === 2 ? ACTIVE_COLOR : NORMAL_COLOR}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: state.index === 2 ? ACTIVE_COLOR : NORMAL_COLOR},
                ]}>
                Subjects
              </Text>
            </View>
          </TouchableOpacity>

          {/* Tasks Tab */}
          <TouchableOpacity
            onPress={() => handleTabPress('Settings')}
            style={styles.tabButton}
            activeOpacity={0.7}>
            <View style={styles.tabContent}>
              <ProfileIcon
                width={24}
                height={24}
                color={state.index === 3 ? ACTIVE_COLOR : NORMAL_COLOR}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: state.index === 3 ? ACTIVE_COLOR : NORMAL_COLOR},
                ]}>
                Settings
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Plus Button */}
        <View style={styles.plusButtonContainer}>
          <View style={styles.plusButtonOutline}>
            <TouchableOpacity
              onPress={handlePlusPress}
              activeOpacity={0.8}
              style={styles.plusButtonTouchable}>
              <LinearGradient
                colors={['#9333EA', '#6366F1']}
                style={styles.plusButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Animated.View
                  style={[
                    styles.plusIconContainer,
                    {transform: [{rotate: rotateInterpolate}]},
                  ]}>
                  <PlusIcon width={24} height={24} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FloatingActionModal
        visible={modalVisible}
        onClose={handleModalClose}
        onAddSubject={handleAddSubject}
        onAddTask={handleAddTask}
        onGenerateAI={handleGenerateAI}
        onImportSubjects={handleImportSubjects}
      />
    </>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    height: 75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  indicator: {
    position: 'absolute',
    top: -1,
    height: 2,
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 2,
  },
  tabButton: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 11,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  centerSpace: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSpaceFill: {
    width: '100%',
    height: '100%',
  },
  plusButtonContainer: {
    position: 'absolute',
    top: -1, // Moved down further to integrate better with tab bar
    left: '50%',
    marginLeft: -40, // Half of the button width to center it
    zIndex: 10,
  },
  plusButtonOutline: {
    width: 80,
    height: 40, // Reduced height for better integration
    borderBottomLeftRadius: 400,
    borderBottomRightRadius: 400,
    backgroundColor: '#18181B', // Background color (same as app background)
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10, // Reduced padding
    borderWidth: 2,
    borderTopWidth: 0, // Remove top border to create flat outline
    borderColor: '#27272A', // Slight border to separate from background
  },
  plusButtonTouchable: {
    borderRadius: 28,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#9333EA',
    // shadowOffset: {
    //   width: 0,
    //   height: 8,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    // elevation: 10,
  },
  plusIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomTabBar;
