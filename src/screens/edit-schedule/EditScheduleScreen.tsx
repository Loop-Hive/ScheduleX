import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import useStore from '../../store/store';
import {CardInterface, Days, Slots} from '../../types/cards';
import {getPreviewColorForBackground} from '../../types/allCardConstraint';
import TimePicker from '../../components/TimePicker';

interface EditScheduleScreenProps {
  navigation: any;
}

// Extended interface for cards with register information
interface CardWithRegisterInfo extends CardInterface {
  _registerIndex?: number;
  _registerColor?: string;
}

// SubjectCard component to display individual subject with its slots
interface SubjectCardProps {
  card: CardInterface;
  selectedDay: number;
  dayKey: keyof Days;
  registerColor: string;
  onAddSlot: (card: CardInterface) => void;
  onEditSlot: (card: CardInterface, slotIndex: number) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({card, selectedDay, dayKey, registerColor, onAddSlot, onEditSlot}) => {
  const slots = card.days[dayKey] || [];

  const formatTime = (timeString: string, isCompact = false) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const paddedMinutes = minutes.padStart(2, '0'); // Ensure minutes always have 2 digits

    if (isCompact) {
      // For compact display, use shorter format
      return `${displayHour}:${paddedMinutes}${ampm}`;
    }
    return `${displayHour}:${paddedMinutes} ${ampm}`;
  };

  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectTitleContainer}>
          <View
            style={[
              styles.subjectColorIndicator,
              {backgroundColor: getPreviewColorForBackground(registerColor)}
            ]}
          />
          <Text style={styles.subjectTitle}>{card.title}</Text>
        </View>
        <TouchableOpacity style={styles.addSlotButtonSmall} onPress={() => onAddSlot(card)}>
          <Image
            source={require('../../assets/icons/plus.png')}
            style={styles.addSlotIconSmall}
          />
          <Text style={styles.addSlotTextSmall}>Add Slot</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slotsContainer}>
        {slots.map((slot, index) => {
          const slotCount = slots.length;
          // Always use 48% width for consistent dimensions across all slot counts
          const slotStyle = { width: '48%' as const };

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotCard,
                slotStyle
              ]}
              onPress={() => onEditSlot(card, index)}>
              <View style={styles.slotTimeContainer}>
                <Text
                  style={[
                    styles.slotTime,
                    slotCount > 2 && styles.slotTimeCompact
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {slotCount > 2
                    ? `${formatTime(slot.start, true)}-${formatTime(slot.end, true)}`
                    : `${formatTime(slot.start)} - ${formatTime(slot.end)}`
                  }
                </Text>
                <Text
                  style={[
                    styles.slotRoom,
                    slotCount > 2 && styles.slotRoomCompact
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {slot.roomName || ' '}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const EditScheduleScreen: React.FC<EditScheduleScreenProps> = ({navigation}) => {
  const [selectedDay, setSelectedDay] = useState(1); // Initialize with Monday (index 1)
  const [selectedTabKey, setSelectedTabKey] = useState('week-1'); // Track which specific tab is selected
  const {registers, activeRegister, editCard, updateDate, selectedRegisters, setSelectedRegisters} = useStore();

  // Register dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal state for adding slots
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [selectedCardForSlot, setSelectedCardForSlot] = useState<CardInterface | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);
  const [newSlotStartTime, setNewSlotStartTime] = useState('09:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('10:00');
  const [newSlotStartAM, setNewSlotStartAM] = useState(true);
  const [newSlotEndAM, setNewSlotEndAM] = useState(true);
  const [newSlotRoom, setNewSlotRoom] = useState('');

  // Initialize selectedRegisters if empty (handles first app launch)
  useEffect(() => {
    if (Object.keys(registers).length > 0 && selectedRegisters.length === 0) {
      setSelectedRegisters([activeRegister]);
    }
  }, [registers, activeRegister, selectedRegisters, setSelectedRegisters]);

  // Get cards from selected registers
  const getAllCards = (): CardWithRegisterInfo[] => {
    const allCards: CardWithRegisterInfo[] = [];
    selectedRegisters.forEach(registerIdx => {
      const register = registers[registerIdx];
      if (register?.cards) {
        register.cards.forEach(card => {
          allCards.push({
            ...card,
            _registerIndex: registerIdx, // Add register index for reference
            _registerColor: register.color, // Add register color for reference
          });
        });
      }
    });
    return allCards;
  };

  const currentCards = getAllCards();

  // Map day indices to day keys
  const dayKeyMap: Record<number, keyof Days> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };

  // Get cards that have slots for the selected day
  const getCardsForSelectedDay = () => {
    const dayKey = dayKeyMap[selectedDay];
    return currentCards.filter(card => {
      const daySlots = card.days[dayKey];
      return daySlots && daySlots.length > 0;
    });
  };

  const cardsWithSlots = getCardsForSelectedDay();

  // Update cards when selected day changes
  useEffect(() => {
    // This will trigger re-render when selectedDay changes
  }, [selectedDay, currentCards]);

  // Helper functions for register selection
  const getAllRegisterIds = () =>
    Object.keys(registers).map(key => parseInt(key, 10));

  const isAllSelected = () => {
    const allIds = getAllRegisterIds();
    return (
      allIds.length > 0 && allIds.every(id => selectedRegisters.includes(id))
    );
  };

  const toggleAllRegisters = () => {
    if (isAllSelected()) {
      setSelectedRegisters([]);
    } else {
      setSelectedRegisters(getAllRegisterIds());
    }
  };

  const toggleRegister = (registerId: number) => {
    if (selectedRegisters.includes(registerId)) {
      setSelectedRegisters(selectedRegisters.filter(id => id !== registerId));
    } else {
      setSelectedRegisters([...selectedRegisters, registerId]);
    }
  };

  const getDropdownDisplayText = () => {
    if (selectedRegisters.length === 0) {
      return 'No registers selected';
    }
    if (isAllSelected()) {
      return 'All Registers';
    }
    if (selectedRegisters.length === 1) {
      return registers[selectedRegisters[0]]?.name || 'Unknown Register';
    }
    return `${selectedRegisters.length} registers selected`;
  };

  // Function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    let hour12 = parseInt(hours);
    const isAM = hour12 < 12;

    if (hour12 === 0) {
      hour12 = 12;
    } else if (hour12 > 12) {
      hour12 -= 12;
    }

    return {
      timeString: `${hour12.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`,
      isAM: isAM
    };
  };

  // Function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (timeString: string, isAM: boolean) => {
    const [hours, minutes] = timeString.split(':');
    let hour24 = parseInt(hours);

    if (isAM && hour24 === 12) {
      hour24 = 0;
    } else if (!isAM && hour24 !== 12) {
      hour24 += 12;
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Function to add a new slot to a card
  const handleAddSlot = (card: CardInterface) => {
    setSelectedCardForSlot(card);
    setSelectedSlotIndex(-1);
    setNewSlotStartTime('09:00');
    setNewSlotEndTime('10:00');
    setNewSlotStartAM(true);
    setNewSlotEndAM(true);
    setNewSlotRoom('');
    setShowAddSlotModal(true);
  };

  // Function to edit an existing slot
  const handleEditSlot = (card: CardInterface, slotIndex: number) => {
    const dayKey = dayKeyMap[selectedDay];
    const slot = card.days[dayKey][slotIndex];

    if (slot) {
      const startTime12 = convertTo12Hour(slot.start);
      const endTime12 = convertTo12Hour(slot.end);

      setSelectedCardForSlot(card);
      setSelectedSlotIndex(slotIndex);
      setNewSlotStartTime(startTime12.timeString);
      setNewSlotEndTime(endTime12.timeString);
      setNewSlotStartAM(startTime12.isAM);
      setNewSlotEndAM(endTime12.isAM);
      setNewSlotRoom(slot.roomName || '');
      setShowEditSlotModal(true);
    }
  };  // Function to save the new slot
  const saveNewSlot = () => {
    if (!selectedCardForSlot) return;

    const startTime24 = convertTo24Hour(newSlotStartTime, newSlotStartAM);
    const endTime24 = convertTo24Hour(newSlotEndTime, newSlotEndAM);

    // Validate time order
    if (startTime24 >= endTime24) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    const dayKey = dayKeyMap[selectedDay];
    const existingSlots = selectedCardForSlot.days[dayKey] || [];

    // Check for time conflicts
    const hasConflict = existingSlots.some(slot => {
      return (startTime24 < slot.end && endTime24 > slot.start);
    });

    if (hasConflict) {
      Alert.alert(
        'Time Conflict',
        'This time slot overlaps with an existing slot. Do you want to add it anyway?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Anyway',
            style: 'destructive',
            onPress: () => {
              // Continue with adding the slot
              const newSlot: Slots = {
                start: startTime24,
                end: endTime24,
                roomName: newSlotRoom.trim() || null,
              };

              // Create updated card with new slot
              const updatedCard: CardInterface = {
                ...selectedCardForSlot,
                days: {
                  ...selectedCardForSlot.days,
                  [dayKey]: [...existingSlots, newSlot],
                },
              };

              // Update the card in the store
              const registerIndex = (selectedCardForSlot as CardWithRegisterInfo)._registerIndex ?? activeRegister;
              editCard(registerIndex, updatedCard, selectedCardForSlot.id);

              // Trigger update to refresh subjects page
              updateDate(new Date());

              // Close modal
              setShowAddSlotModal(false);
              setSelectedCardForSlot(null);
            }
          }
        ]
      );
      return;
    }

    const newSlot: Slots = {
      start: startTime24,
      end: endTime24,
      roomName: newSlotRoom.trim() || null,
    };

    // Create updated card with new slot
    const updatedCard: CardInterface = {
      ...selectedCardForSlot,
      days: {
        ...selectedCardForSlot.days,
        [dayKey]: [...existingSlots, newSlot],
      },
    };

    // Update the card in the store
    const registerIndex = (selectedCardForSlot as CardWithRegisterInfo)._registerIndex ?? activeRegister;
    editCard(registerIndex, updatedCard, selectedCardForSlot.id);

    // Trigger update to refresh subjects page
    updateDate(new Date());

    // Close modal
    setShowAddSlotModal(false);
    setSelectedCardForSlot(null);
  };

  // Function to save edited slot
  const saveEditedSlot = () => {
    if (!selectedCardForSlot || selectedSlotIndex === -1) return;

    const startTime24 = convertTo24Hour(newSlotStartTime, newSlotStartAM);
    const endTime24 = convertTo24Hour(newSlotEndTime, newSlotEndAM);

    // Validate time order
    if (startTime24 >= endTime24) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    const dayKey = dayKeyMap[selectedDay];
    const existingSlots = selectedCardForSlot.days[dayKey] || [];

    // Check for time conflicts (excluding the current slot being edited)
    const hasConflict = existingSlots.some((slot, index) => {
      if (index === selectedSlotIndex) return false; // Skip the slot being edited
      return (startTime24 < slot.end && endTime24 > slot.start);
    });

    if (hasConflict) {
      Alert.alert(
        'Time Conflict',
        'This time slot overlaps with an existing slot. Do you want to update it anyway?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Update Anyway',
            style: 'destructive',
            onPress: () => {
              // Continue with updating the slot
              const updatedSlot: Slots = {
                start: startTime24,
                end: endTime24,
                roomName: newSlotRoom.trim() || null,
              };

              // Create updated slots array with the edited slot
              const updatedSlots = [...existingSlots];
              updatedSlots[selectedSlotIndex] = updatedSlot;

              const updatedCard: CardInterface = {
                ...selectedCardForSlot,
                days: {
                  ...selectedCardForSlot.days,
                  [dayKey]: updatedSlots,
                },
              };

              // Update the card in the store
              const registerIndex = (selectedCardForSlot as CardWithRegisterInfo)._registerIndex ?? activeRegister;
              editCard(registerIndex, updatedCard, selectedCardForSlot.id);

              // Trigger update to refresh subjects page
              updateDate(new Date());

              // Close modal
              setShowEditSlotModal(false);
              setSelectedCardForSlot(null);
              setSelectedSlotIndex(-1);
            }
          }
        ]
      );
      return;
    }

    const updatedSlot: Slots = {
      start: startTime24,
      end: endTime24,
      roomName: newSlotRoom.trim() || null,
    };

    // Create updated slots array with the edited slot
    const updatedSlots = [...existingSlots];
    updatedSlots[selectedSlotIndex] = updatedSlot;

    // Create updated card with edited slot
    const updatedCard: CardInterface = {
      ...selectedCardForSlot,
      days: {
        ...selectedCardForSlot.days,
        [dayKey]: updatedSlots,
      },
    };

    // Update the card in the store
    const registerIndex = (selectedCardForSlot as CardWithRegisterInfo)._registerIndex ?? activeRegister;
    editCard(registerIndex, updatedCard, selectedCardForSlot.id);

    // Trigger update to refresh subjects page
    updateDate(new Date());

    // Close modal
    setShowEditSlotModal(false);
    setSelectedCardForSlot(null);
    setSelectedSlotIndex(-1);
  };

  // Function to delete slot
  const deleteSlot = () => {
    if (!selectedCardForSlot || selectedSlotIndex === -1) return;

    Alert.alert(
      'Delete Time Slot',
      'Are you sure you want to delete this time slot?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const dayKey = dayKeyMap[selectedDay];
            const existingSlots = selectedCardForSlot.days[dayKey] || [];

            // Remove the slot at the selected index
            const updatedSlots = existingSlots.filter((_, index) => index !== selectedSlotIndex);

            // Create updated card with slot removed
            const updatedCard: CardInterface = {
              ...selectedCardForSlot,
              days: {
                ...selectedCardForSlot.days,
                [dayKey]: updatedSlots,
              },
            };

            // Update the card in the store
            const registerIndex = (selectedCardForSlot as CardWithRegisterInfo)._registerIndex ?? activeRegister;
            editCard(registerIndex, updatedCard, selectedCardForSlot.id);

            // Trigger update to refresh subjects page
            updateDate(new Date());

            // Close modal
            setShowEditSlotModal(false);
            setSelectedCardForSlot(null);
            setSelectedSlotIndex(-1);
          },
        },
      ],
    );
  };

  // Function to cancel adding slot
  const cancelAddSlot = () => {
    setShowAddSlotModal(false);
    setSelectedCardForSlot(null);
  };

  // Function to cancel editing slot
  const cancelEditSlot = () => {
    setShowEditSlotModal(false);
    setSelectedCardForSlot(null);
    setSelectedSlotIndex(-1);
  };

  // Get all days of week
  const getAllDays = () => [
    {name: 'Sunday', fullName: 'Sunday', index: 0},
    {name: 'Monday', fullName: 'Monday', index: 1},
    {name: 'Tuesday', fullName: 'Tuesday', index: 2},
    {name: 'Wednesday', fullName: 'Wednesday', index: 3},
    {name: 'Thursday', fullName: 'Thursday', index: 4},
    {name: 'Friday', fullName: 'Friday', index: 5},
    {name: 'Saturday', fullName: 'Saturday', index: 6},
  ];

  // Get ordered days with Monday through Sunday only
  const getOrderedDays = () => {
    const allDays = getAllDays();
    const orderedDays = [];

    // Add complete week Monday through Sunday
    // Start with Monday (index 1) and go through Sunday (index 0)
    const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

    for (const dayIndex of weekOrder) {
      orderedDays.push({
        name: allDays[dayIndex].name,
        fullName: allDays[dayIndex].fullName,
        index: dayIndex,
        isSpecial: false,
        tabKey: `week-${dayIndex}`,
      });
    }

    return orderedDays;
  };

  const daysOfWeek = getOrderedDays();  return (
    <View style={styles.container}>
      {isDropdownOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        />
      )}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/icons/left-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>Edit Schedule</Text>
        </View>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Text
              style={styles.dropdownButtonText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {getDropdownDisplayText()}
            </Text>
            <Text style={styles.dropdownArrow}>
              {isDropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  isAllSelected() && styles.dropdownItemSelected,
                ]}
                onPress={toggleAllRegisters}>
                <View style={styles.dropdownItemContent}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isAllSelected() && styles.dropdownItemTextSelected,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    All Registers
                  </Text>
                </View>
              </TouchableOpacity>
              {getAllRegisterIds().map(registerId => (
                <TouchableOpacity
                  key={registerId}
                  style={[
                    styles.dropdownItem,
                    selectedRegisters.includes(registerId) &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => toggleRegister(registerId)}>
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.registerItem}>
                      <View
                        style={[
                          styles.colorIndicator,
                          {
                            backgroundColor: getPreviewColorForBackground(
                              registers[registerId]?.color || '#FFFFFF',
                            ),
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedRegisters.includes(registerId) &&
                            styles.dropdownItemTextSelected,
                        ]}
                        numberOfLines={1}>
                        {registers[registerId]?.name || 'Unknown Register'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Day Navigation Tabs */}
      <View style={styles.dayTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsScrollView}
          bounces={false}
          decelerationRate="fast">
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day.tabKey}
              style={[
                styles.dayTab,
                selectedTabKey === day.tabKey && styles.dayTabActive,
              ]}
              onPress={() => {
                setSelectedDay(day.index);
                setSelectedTabKey(day.tabKey);
              }}>
              <Text
                style={[
                  styles.dayTabText,
                  selectedTabKey === day.tabKey && styles.dayTabTextActive,
                ]}>
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.contentContainer}>
        {cardsWithSlots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No subjects scheduled for {daysOfWeek.find(day => day.tabKey === selectedTabKey)?.name}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add subjects to this day to get started
            </Text>
          </View>
        ) : (
          <View style={styles.subjectsContainer}>
            {cardsWithSlots.map((card, index) => (
              <SubjectCard
                key={`${(card as CardWithRegisterInfo)._registerIndex ?? 0}-${card.id}`}
                card={card}
                selectedDay={selectedDay}
                dayKey={dayKeyMap[selectedDay]}
                registerColor={(card as CardWithRegisterInfo)._registerColor || card.tagColor}
                onAddSlot={handleAddSlot}
                onEditSlot={handleEditSlot}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal
        visible={showAddSlotModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelAddSlot}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Time Slot</Text>
              <Text style={styles.modalSubtitle}>
                {selectedCardForSlot?.title} - {daysOfWeek.find(day => day.tabKey === selectedTabKey)?.name}
              </Text>
            </View>

            <View style={styles.modalContent}>
              {/* Start Time */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <View style={styles.timePickerContainer}>
                  <TimePicker
                    timeString={newSlotStartTime}
                    isAM={newSlotStartAM}
                    changeIsAM={setNewSlotStartAM}
                    changeTimeString={setNewSlotStartTime}
                  />
                </View>
              </View>

              {/* End Time */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>End Time</Text>
                <View style={styles.timePickerContainer}>
                  <TimePicker
                    timeString={newSlotEndTime}
                    isAM={newSlotEndAM}
                    changeIsAM={setNewSlotEndAM}
                    changeTimeString={setNewSlotEndTime}
                  />
                </View>
              </View>

              {/* Room/Location */}
              <View style={styles.roomSection}>
                <Text style={styles.roomLabel}>Room/Location (Optional)</Text>
                <TextInput
                  style={styles.roomInput}
                  value={newSlotRoom}
                  onChangeText={setNewSlotRoom}
                  placeholder="Enter room or location"
                  placeholderTextColor="#8B8B8B"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelAddSlot}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveNewSlot}>
                <Text style={styles.saveButtonText}>Add Slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        visible={showEditSlotModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelEditSlot}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Time Slot</Text>
              <Text style={styles.modalSubtitle}>
                {selectedCardForSlot?.title} - {daysOfWeek.find(day => day.tabKey === selectedTabKey)?.name}
              </Text>
            </View>

            <View style={styles.modalContent}>
              {/* Start Time */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <View style={styles.timePickerContainer}>
                  <TimePicker
                    timeString={newSlotStartTime}
                    isAM={newSlotStartAM}
                    changeIsAM={setNewSlotStartAM}
                    changeTimeString={setNewSlotStartTime}
                  />
                </View>
              </View>

              {/* End Time */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>End Time</Text>
                <View style={styles.timePickerContainer}>
                  <TimePicker
                    timeString={newSlotEndTime}
                    isAM={newSlotEndAM}
                    changeIsAM={setNewSlotEndAM}
                    changeTimeString={setNewSlotEndTime}
                  />
                </View>
              </View>

              {/* Room/Location */}
              <View style={styles.roomSection}>
                <Text style={styles.roomLabel}>Room/Location (Optional)</Text>
                <TextInput
                  style={styles.roomInput}
                  value={newSlotRoom}
                  onChangeText={setNewSlotRoom}
                  placeholder="Enter room or location"
                  placeholderTextColor="#8B8B8B"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.deleteButton} onPress={deleteSlot}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEditSlot}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveEditedSlot}>
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    marginLeft: 8,
    marginRight: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    minWidth: 150,
    maxWidth: 200,
  },
  dropdownButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  dropdownArrow: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  dropdownItemSelected: {
    backgroundColor: '#8B5CF620',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  registerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  dayTabsContainer: {
    backgroundColor: '#18181B',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dayTabsScrollView: {
    paddingHorizontal: 4,
    paddingRight: 20, // Add extra padding at the end to ensure all tabs are accessible
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#475569',
    backgroundColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    transform: [{scale: 1.05}],
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#8B8B8B',
    fontSize: 14,
    textAlign: 'center',
  },
  subjectsContainer: {
    padding: 16,
  },
  subjectCard: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  subjectTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  attendanceText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  addSlotButtonSmall: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotIconSmall: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
    marginRight: 4,
  },
  addSlotTextSmall: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  slotCard: {
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#404040',
    minHeight: 56, // Fixed minimum height for consistency
  },
  slotTimeContainer: {
    flex: 1,
    justifyContent: 'space-between', // Distribute space evenly
    minHeight: 40, // Ensure consistent internal height
  },
  slotTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4, // Consistent spacing
  },
  slotTimeCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4, // Consistent spacing
  },
  slotRoom: {
    color: '#8B8B8B',
    fontSize: 12,
    minHeight: 14, // Ensure consistent height even when empty
  },
  slotRoomCompact: {
    fontSize: 10,
    minHeight: 12, // Ensure consistent height even when empty
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    margin: 20,
    maxHeight: '65%', // Reduced from 80% to 65%
    width: '85%', // Reduced from 90% to 85%
    maxWidth: 400, // Added max width for larger screens
  },
  modalHeader: {
    padding: 16, // Reduced from 20 to 16
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18, // Reduced from 20 to 18
    fontWeight: 'bold',
    marginBottom: 2, // Reduced from 4 to 2
  },
  modalSubtitle: {
    color: '#8B8B8B',
    fontSize: 13, // Reduced from 14 to 13
  },
  modalContent: {
    padding: 16, // Reduced from 20 to 16
  },
  timeSection: {
    marginBottom: 16, // Reduced from 20 to 16
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    marginBottom: 6, // Reduced from 8 to 6
  },
  timePickerContainer: {
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    padding: 10, // Reduced from 12 to 10
    borderWidth: 1,
    borderColor: '#404040',
  },
  roomSection: {
    marginBottom: 16, // Reduced from 20 to 16
  },
  roomLabel: {
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    marginBottom: 6, // Reduced from 8 to 6
  },
  roomInput: {
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    padding: 10, // Reduced from 12 to 10
    borderWidth: 1,
    borderColor: '#404040',
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16, // Reduced from 20 to 16
    paddingTop: 0,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#404040',
    borderRadius: 8,
    padding: 12, // Reduced from 14 to 12
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 12, // Reduced from 14 to 12
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12, // Reduced from 14 to 12
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
  },
});

export default EditScheduleScreen;
