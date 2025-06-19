import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChatIcon} from '../assets/icons/navigation/home';
type Props = {
  toggler: () => void;
  changeStack: (type: string) => void;
  registerName: string;
};

const Header: React.FC<Props> = ({toggler, changeStack, registerName}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={toggler}>
          <Image
            source={require('../assets/images/registers.png')}
            style={styles.registerIcon}
          />
        </TouchableOpacity>

        <Text style={styles.registerNameTxt}>{registerName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks' as never)}>
          <ChatIcon width={35} height={35} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#18181B',
  },
  registerIcon: {width: 42, height: 42},
  headerContent: {
    margin: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
    paddingBottom: 5,
    // paddingTop: 20,
  },
  registerNameTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'white',
  },
  addBtn: {
    padding: 7,
    paddingHorizontal: 15,
    backgroundColor: '#27272A',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
  },
  addBtnTxt: {color: 'white', fontSize: 16, fontWeight: 'bold'},
});

export default Header;
