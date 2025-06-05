import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  timeString: string; // 12:00
  isAM: boolean; // True or False
  changeIsAM: (isAM: boolean) => void;
  changeTimeString: (timeString: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  timeString,
  isAM,
  changeIsAM,
  changeTimeString,
}) => {
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(isAM ? hours : hours + 12);
    date.setMinutes(minutes);
    setTime(date);
  }, [timeString, isAM]);

  const onChange = (event: any, selectedTime: Date | undefined) => {
    setShow(false);
    if (selectedTime) {
      setTime(selectedTime);
      let hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const newIsAM = hours < 12;
      if (hours === 0) {
        hours = 12;
      } else if (hours > 12) {
        hours -= 12;
      }
      const newTimeString = `${hours.toString().padStart(2, '0')}:${
        minutes < 10 ? '0' : ''
      }${minutes}`;
      changeIsAM(newIsAM);
      changeTimeString(newTimeString);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)} style={styles.ampm}>
        <Text style={styles.timeText}>
          {timeString.padStart(5, '0')}
          {isAM ? ' AM' : ' PM'}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ampm: {
    backgroundColor: '#1F1F22',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#464646',
  },
  timeText: {color: '#fff'},
});

export default TimePicker;
