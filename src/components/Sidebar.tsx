import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Easing,
  Alert,
  TextInput,
} from 'react-native';
import useStore from '../store/store';

type RegisterProps = {
  name: string;
  index: number;
  isActive: boolean;
  isDropdownOpen: boolean;
  setDropdownIndex: (index: number) => void;
};

const Register: React.FC<RegisterProps> = ({
  name,
  index,
  isActive,
  isDropdownOpen,
  setDropdownIndex,
}) => {
  const {
    setActiveRegister,
    removeRegister,
    renameRegister,
    clearCardsAttendance,
  } = useStore();

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
  };
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  const setIsDropdownOpen = (value: boolean) => {
    setDropdownIndex(value ? index : -1);
  };

  const handleActiveRegister = () => {
    if (isEditable) {
      return;
    }
    setActiveRegister(index);
  };
  const [displayName, setDisplayName] = useState(name);
  const [isEditable, setIsEditable] = useState(false);

  const handleRegisterDelete = () => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this register?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            removeRegister(index);
            toggleDropdown();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleInputChange = (text: string) => {
    setDisplayName(text);
  };
  const handleRename = () => {
    setIsEditable(true);
    toggleDropdown();
  };
  const handleMenuOrRename = () => {
    if (isEditable) {
      if (displayName.length === 0) {
        Alert.alert('Invalid Name', 'Name cannot be empty', [
          {
            text: 'OK',
          },
        ]);
        return;
      }
      renameRegister(index, displayName);
      setIsEditable(false);
    } else {
      toggleDropdown();
    }
  };
  const handleClearCards = () => {
    Alert.alert(
      'Clear',
      'Are you sure you want to clear this register?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            clearCardsAttendance(index);
            toggleDropdown();
          },
        },
      ],
      {cancelable: false},
    );
  };
  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: isDropdownOpen ? 42 : 0,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isDropdownOpen, dropdownHeight]);
  return (
    <View style={styles.registerBox}>
      <Text style={styles.regId}>{index + 1}</Text>
      <TouchableOpacity style={styles.menu} onPress={handleMenuOrRename}>
        {isEditable ? (
          <Image
            source={require('../assets/icons/mark-present.png')}
            style={styles.markPresentIcon}
          />
        ) : (
          <Image
            source={require('../assets/icons/three-dot.png')}
            style={styles.threeDotsIcon}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.registerButton,
          isDropdownOpen && styles.registerButtonDropdownOpen, // Style for dropdown open
          isActive && styles.activeRegisterButton, // Style for active register
        ]}
        onPress={handleActiveRegister}>
        <Text style={styles.emojiText}>📝</Text>
        <TextInput
          value={displayName}
          editable={isEditable}
          onChangeText={text => handleInputChange(text)}
          style={styles.menuText}
          // numberOfLines={1}
          maxLength={13}
        />
      </TouchableOpacity>
      {isDropdownOpen && (
        <View style={styles.dropdownWrapper}>
          <Animated.View style={[styles.dropdown, {height: dropdownHeight}]}>
            <View style={styles.editDropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleRename}>
                <Image
                  source={require('../assets/icons/dropDownMenu/rename.png')}
                  style={styles.renameIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleClearCards}>
                <Image
                  source={require('../assets/icons/dropDownMenu/clear.png')}
                  style={styles.clearIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleRegisterDelete}>
                <Image
                  source={require('../assets/icons/dropDownMenu/delete.png')}
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};
const Sidebar: React.FC = () => {
  const {registers, activeRegister, addRegister} = useStore();
  const [dropDownIndex, setDropdownIndex] = useState(-1);
  const handleAddRegister = () => {
    if (Object.keys(registers).length >= 10) {
      Alert.alert(
        'Limit Reached',
        'You have reached the limit of 10 registers. Please delete some registers to add new ones.',
        [
          {
            text: 'OK',
          },
        ],
        {cancelable: false},
      );
      return;
    }

    Alert.alert(
      'Add New Register',
      'Are you sure you want to add a new register?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const newRegisterId = Object.keys(registers).length;
            addRegister(newRegisterId, `Register ${newRegisterId + 1}`);
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.mainContent}>
        <Text style={styles.sidebarText}>My Registers</Text>
      </View>
      {/* register component */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        {Object.keys(registers).map((key: any, index: number) => {
          return (
            <Register
              name={registers[key].name}
              isActive={Number(key) === Number(activeRegister) ? true : false}
              isDropdownOpen={dropDownIndex === index}
              setDropdownIndex={setDropdownIndex}
              index={Number(key)}
              key={index}
            />
          );
        })}

        {/* <ActiveRegister name={'Active Register'} index={0} />
        <Register name={'Register 1dsgdashgdfgsd'} index={1} /> */}
      </ScrollView>
      <View style={styles.createButton}>
        <TouchableOpacity
          style={styles.createButtonStyles}
          onPress={handleAddRegister}>
          <Text style={styles.mainText}>Add</Text>
          <Image
            source={require('../assets/icons/add-register.png')}
            style={styles.addRegisterIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  addRegisterIcon: {width: 20, height: 20},
  renameIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
    tintColor: 'white',
  },
  clearIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
    tintColor: 'white',
  },
  deleteIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
    tintColor: 'white',
  },
  markPresentIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  threeDotsIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    objectFit: 'contain',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
    marginRight: 40,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 50,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 20,
  },

  mainContent: {
    marginTop: 5,
    marginBottom: 25,
  },
  menuButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  registerBox: {
    position: 'relative',
  },
  menu: {
    position: 'absolute',
    top: 11,
    right: 5,
  },
  menuText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1, // Allows the text to shrink to fit the available space
    overflow: 'hidden', // Hides any overflowing content
  },
  emojiText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'semibold',
  },
  registerButton: {
    minWidth: '80%',
    marginRight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    paddingLeft: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#464646',
  },
  activeRegisterButton: {
    minWidth: '80%',
    marginRight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#128700',
    paddingLeft: 25,
    borderColor: '#045600',
    borderRadius: 10,
    borderWidth: 1,
  },
  registerButtonDropdownOpen: {
    borderBottomRightRadius: 0, // Override only when dropdown is open
    borderBottomLeftRadius: 0,
  },
  regId: {
    position: 'absolute',
    left: 7,
    top: 15,
    fontSize: 12,
    color: '#fff',
    zIndex: 100,
  },
  createButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    marginBottom: 10,
  },
  createButtonStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#828282',
    borderRadius: 8,
    gap: 10,
    padding: 7,
    paddingLeft: 14,
    paddingRight: 14,
  },
  dropdown: {
    // width: '100%',
    backgroundColor: '#3F3F3F',
    overflow: 'hidden',
    borderRadius: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },

  editDropdown: {
    flexDirection: 'row',
    gap: 20,
    // alignItems: 'center',
    justifyContent: 'center',
  },

  dropdownItem: {
    padding: 10,
    maxWidth: 60,
  },
  dropdownItemText: {
    fontSize: 16,
  },

  // fixLine: {
  //     position: 'absolute',
  //     bottom: -1,
  //     right: -40,
  //     width: 40,
  //     borderBottomWidth: 1,
  //     borderBottomColor: '#ccc',
  // },
});

export default Sidebar;
