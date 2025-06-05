import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  //   descriptors,
  navigation,
}) => {
  const [footerWidth, setFooterWidth] = useState(0);
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const ACTIVE_COLOR = '#F2F3F4';
  const INDICATOR_WIDTH = 40;
  const tabWidth = footerWidth / state.routes.length;
  const offset = state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;

  useEffect(() => {
    if (footerWidth === 0) {
      return;
    } // wait for layout

    if (!indicatorVisible) {
      tabIndicator.setValue(offset);
      setIndicatorVisible(true);
    } else {
      Animated.timing(tabIndicator, {
        toValue: offset,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [state.index, footerWidth, indicatorVisible, offset, tabIndicator]);

  return (
    <View style={styles.navigationBar}>
      <View
        style={styles.footer}
        onLayout={event => {
          const {width} = event.nativeEvent.layout;
          setFooterWidth(width);
        }}>
        {/* Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{translateX: tabIndicator}],
              backgroundColor: ACTIVE_COLOR,
              width: INDICATOR_WIDTH,
            },
          ]}
        />
        {state.routes.map((route, index) => {
          //   const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: any = null;
          if (route.name === 'Home') {
            iconName = require('../assets/icons/navigation/home.png');
          } else if (route.name === 'Settings') {
            iconName = require('../assets/icons/navigation/settings.png');
          } else if (route.name === 'Ai') {
            iconName = require('../assets/icons/navigation/ai.png');
          } else if (route.name === 'Teams') {
            iconName = require('../assets/icons/navigation/team.png');
          } else if (route.name === 'Time') {
            iconName = require('../assets/icons/navigation/time-table.png');
          }
          const tintColorVariable = isFocused ? '#F2F3F4' : '#888';
          return (
            <TouchableOpacity
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.button}
              key={route.name}>
              <View style={styles.boxy}>
                <Image
                  source={iconName}
                  style={[styles.logo, {tintColor: tintColorVariable}]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    width: '100%',
    height: 65,
    position: 'absolute',
    bottom: 0,
    // top: 70,
    left: 0,
  },
  footer: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#27272A',

    height: 65,
    flexDirection: 'row',
  },
  logo: {
    width: 25,
    height: 25,
  },
  button: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    height: '100%',
  },
  boxy: {
    width: '100%',
    // paddingLeft: 5,
    // paddingRight: 5,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    // width: 70,
    height: 1,
    borderRadius: 1,
  },
});

export default CustomTabBar;
