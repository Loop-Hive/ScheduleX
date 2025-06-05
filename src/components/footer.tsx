import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';

type FooterProps = {
  navigate: (screen: string) => void;
};
const Footer: React.FC<FooterProps> = ({navigate}) => {
  // const [activeNum, setActiveNum] = useState(5);
  return (
    <View style={styles.navigationBar}>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('Home')}>
          <Image
            source={require('../assets/icons/navigation/home.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('Teams')}>
          <Image
            source={require('../assets/icons/navigation/team.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigate('Ai')}>
          <Image
            source={require('../assets/icons/navigation/ai.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('Time')}>
          <Image
            source={require('../assets/icons/navigation/time-table.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('Settings')}>
          <Image
            source={require('../assets/icons/navigation/settings.png')}
            style={styles.logo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    width: '100%',
    height: 80,
    position: 'absolute',
    bottom: 8,
    left: 0,
    backgroundColor: '#27272A',
  },
  footer: {
    width: '95%',
    borderRadius: 50,
    margin: 'auto',
    // backgroundColor: '#27272A',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  logo: {
    width: 30,
    height: 30,
  },
  button: {
    alignItems: 'center',
    position: 'relative',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  activeTab: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: -25,
    left: -25,
    zIndex: -1,
  },
});

export default Footer;
