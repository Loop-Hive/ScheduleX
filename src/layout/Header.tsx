import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChatIcon} from '../assets/icons/navigation/home';
import { ScrollView } from 'react-native';
import { Animated, Easing } from 'react-native';


type Props = {
  toggler: () => void;
  changeStack: (type: string) => void;
  registerName: string;
};

const Header: React.FC<Props> = ({toggler, changeStack, registerName}) => {
  const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(-250)).current; // hidden sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(slideAnim, {
        toValue: -250,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={toggleSidebar}
          style={{
            backgroundColor: '#4ECDC4',
            padding: 8,
            borderRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/images/menu-icon.png')}
            style={styles.registerIcon}
          />
        </TouchableOpacity>

        <Text style={styles.registerNameTxt}>{registerName}</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings' as never)}
          style={{
            backgroundColor: '#27272A',
            padding: 8,
            borderRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Image
            source={require('../assets/images/profile.png')}
            style={styles.registerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Animated Sidebar */}
      <Animated.View
  style={{
    position: 'absolute',
    top: 60,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#18181B',
    transform: [{ translateX: slideAnim }],
    zIndex: 999,
    padding: 16,
  }}
>
  <ScrollView>
    {['Home', 'Profile', 'Schedule', 'Settings', 'Help'].map((item, index) => (
      <TouchableOpacity
        key={index}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 10,
          borderRadius: 10,
          marginBottom: 8,
          backgroundColor: 'transparent', // can change on active/press
        }}
        activeOpacity={0.7}
        onPress={() => {
          console.log(`${item} pressed`);
          // You can call navigation or changeStack here
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{item}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#18181B',
    paddingVertical: 10,
  },
  registerIcon: { width: 42, height: 42 },
  headerContent: {
    margin: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
    paddingBottom: 5,
  },
  registerNameTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'white',
  },
});

export default Header;
