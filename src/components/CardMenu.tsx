import React, {useRef, useEffect, useState} from 'react';
import {
  // View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  // Easing,
  Alert,
  Image,
  // Dimensions,
} from 'react-native';
import useStore from '../store/store';

interface CardMenuProps {
  isVisible: boolean;
  onClose: () => void;
  RegisterId: number;
  CardId: number;
  navigation: any;
  makeChange: () => void;
}
// const width = Dimensions.get('window').width;
const CardMenu: React.FC<CardMenuProps> = ({
  isVisible,
  onClose,
  RegisterId,
  CardId,
  navigation,
  makeChange,
}) => {
  const {removeCard, registers, undoChanges} = useStore();
  const [cardName, setCardName] = useState('');
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position off-screen

  useEffect(() => {
    if (
      RegisterId !== -1 &&
      CardId !== -1 &&
      registers[RegisterId]?.cards[CardId]?.title
    ) {
      setCardName(registers[RegisterId].cards[CardId].title);
    }
  }, [RegisterId, CardId, registers]);
  const overlayOpacity = useRef(new Animated.Value(0)).current; // Initial opacity
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7, // Lower friction for smoother animation
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300, // Duration for fade-in effect
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, overlayOpacity, slideAnim]);
  const handleEdit = () => {
    navigation.navigate('Edit', {
      card_register: RegisterId,
      card_id: CardId,
    });
    onClose();
  };

  const handleUndoChanges = () => {
    undoChanges(RegisterId, CardId);
    makeChange();
  };
  const handleViewDetails = () => {
    navigation.navigate('CardDetails', {
      card_register: RegisterId,
      card_id: CardId,
    });
    onClose();
  };

  const handleRemoveCard = () => {
    Alert.alert('Delete Card', 'Are you sure you want to delete ' + cardName, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          removeCard(RegisterId, CardId);
          onClose();
        },
      },
    ]);
  };
  const handleMenuClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 300,
        friction: 7, // Lower friction for smoother animation
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300, // Duration for fade-out effect
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (RegisterId === -1 || CardId === -1) {
    return null;
  }
  return (
    <>
      <Animated.View
        style={[styles.overlay, {opacity: overlayOpacity}]}
        pointerEvents={isVisible ? 'auto' : 'none'}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleMenuClose}
        />
      </Animated.View>
      <Animated.View
        style={[styles.container, {transform: [{translateY: slideAnim}]}]}>
        <TouchableOpacity style={styles.button} onPress={handleEdit}>
          <Image
            source={require('../assets/icons/card-menu/edit.png')}
            style={styles.editIcon}
          />
          <Text style={styles.buttonText}>Edit Subject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewDetails}>
          <Image
            source={require('../assets/icons/card-menu/report.png')}
            style={styles.reportIcon}
          />
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleUndoChanges}>
          <Image
            source={require('../assets/icons/card-menu/undo.png')}
            style={styles.undoIcon}
          />
          <Text style={styles.buttonText}>Undo Last Change</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRemoveCard}>
          <Image
            source={require('../assets/icons/card-menu/delete.png')}
            style={styles.deleteIcon}
          />
          <Text style={styles.buttonText}>Delete Subject</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000000,
  },
  editIcon: {width: 20, height: 20},
  reportIcon: {width: 20, height: 20, objectFit: 'contain'},
  undoIcon: {width: 18, height: 18, objectFit: 'contain'},
  deleteIcon: {width: 18, height: 18},
  button: {
    width: '100%',
    padding: 10,
    paddingLeft: 40,
    maxWidth: 600,
    flexDirection: 'row',
    gap: 20,
    borderRadius: 10,
    marginHorizontal: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    padding: 15,
    backgroundColor: '#555',
    borderRadius: 10,
    marginVertical: 5,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 100,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default CardMenu;
