import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, ToastAndroid} from 'react-native';
import styles from '../../styles/CardStyles';
import ConicGradient from './ConicGradient';
import useStore from '../../store/store';

import * as Animatable from 'react-native-animatable';

interface CardProps {
  id: number;
  title: string;
  present: number;
  total: number;
  target_percentage: number;
  tagColor: string;
  cardRegister: number;
  handleMenuOpen: (r: number, c: number) => void;
  hasLimit: boolean;
  limitFreq: number;
  limitType: string;
  handleViewDetails: (r: number, c: number) => void;
  delay: number;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  present,
  total,
  target_percentage,
  tagColor,
  cardRegister,
  hasLimit,
  limitFreq,
  limitType,
  handleMenuOpen,
  handleViewDetails,
  delay,
}) => {
  const {markPresent, markAbsent} = useStore();
  const [percentage, setPercentage] = useState(0);
  const [cardColor, setCardColor] = useState('#892B2B');
  const [cardPresents, setCardPresents] = useState(present);
  const [cardTotals, setCardTotals] = useState(total);
  const [cardStatus, setCardStatus] = useState('on track');

  useEffect(() => {
    setCardPresents(present);
    setCardTotals(total);
  }, [present, total]);

  useEffect(() => {
    const getStatus = () => {
      if (percentage >= target_percentage) {
        let totalClasses = cardTotals + 1;
        let myPercentage = percentage;
        let canLeave = -1;
        while (myPercentage >= target_percentage) {
          myPercentage = (cardPresents / totalClasses) * 100;
          canLeave++;
          totalClasses++;
        }

        if (canLeave === 0) {
          return 'on track, cannot leave next class';
        }
        if (canLeave === 1) {
          return 'on track, can leave 1 class';
        } else {
          return 'can leave ' + canLeave + ' classes';
        }
      } else {
        let totalClasses = cardTotals;
        let presentClasses = cardPresents;
        let myPercentage = percentage;
        let cannotMiss = 0;
        while (myPercentage < target_percentage) {
          myPercentage = (presentClasses / totalClasses) * 100;
          cannotMiss++;
          presentClasses++;
          totalClasses++;
        }
        if (cannotMiss === 1 || cannotMiss === 0) {
          return 'cannot leave next class';
        } else {
          return 'cannot leave next ' + cannotMiss + ' classes';
        }
      }
    };
    setCardStatus(getStatus());
  }, [cardTotals, cardPresents, percentage, target_percentage]);

  const MarkPresent = () => {
    setCardPresents(prev => prev + 1);
    setCardTotals(prev => prev + 1);
    markPresent(cardRegister, id);
    ToastAndroid.show(
      title.length > 14 ? title.substring(0, 15) + '..' : title + ': Present++',
      ToastAndroid.SHORT,
    );
  };
  const MarkAbsent = () => {
    setCardTotals(prev => prev + 1);
    markAbsent(cardRegister, id);
    ToastAndroid.show(
      title.length > 14 ? title.substring(0, 15) + '..' : title + ': Absent++',
      ToastAndroid.SHORT,
    );
  };
  useEffect(() => {
    const updatePercentage = () => {
      const percent =
        cardTotals === 0 ? '0' : ((cardPresents / cardTotals) * 100).toFixed(1);
      setPercentage(Number(percent));
    };
    updatePercentage();
  }, [cardPresents, cardTotals]);

  useEffect(() => {
    const setColor = () => {
      if (percentage > target_percentage) {
        setCardColor('#1A5F18');
      } else if (percentage < target_percentage) {
        setCardColor('#892B2B');
      } else {
        setCardColor('#006D90');
      }
    };
    setColor();
  }, [percentage, target_percentage]);

  return (
    <Animatable.View
      animation="zoomIn"
      delay={delay + 100}
      duration={500}
      style={styles.cardWrapper}>
      <View style={[styles.cardContainer, {backgroundColor: cardColor}]}>
        <View style={styles.leftBox}>
          <View style={styles.header}>
            <View style={[styles.indicator, {backgroundColor: tagColor}]} />
            <Text style={styles.headerTitle}>
              {title.length > 14 ? title.substring(0, 15) + '..' : title}
            </Text>
          </View>
          <View>
            <View style={styles.ratioBox}>
              <Text style={styles.attendanceText}>Attended</Text>
              <View style={styles.attendanceCountBox}>
                <Text style={styles.attendanceCount}>
                  {' '}
                  {cardPresents}/{cardTotals}
                </Text>
              </View>
            </View>
            {hasLimit && (
              <Text style={styles.statusText}>
                Count left:{' '}
                {Math.max(
                  0,
                  limitFreq -
                    (limitType === 'with-absent' ? cardTotals : cardPresents),
                )}
              </Text>
            )}
            {!hasLimit && (
              <Text style={styles.statusText}>Status: {cardStatus}</Text>
            )}
          </View>
        </View>
        <View style={styles.rightBox}>
          <View style={styles.circularContainer}>
            <View
              style={[styles.circularProgress, {backgroundColor: cardColor}]}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            <ConicGradient percentage={percentage + 1} />
          </View>
          <TouchableOpacity
            style={styles.threeDotBig}
            onPress={() => handleMenuOpen(cardRegister, id)}>
            <Image
              source={require('../../assets/icons/three-dot.png')}
              style={styles.threeDotBigIcon}
            />
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={MarkPresent}
              style={styles.actionButtonCover}>
              <Image
                source={require('../../assets/icons/mark-present.png')}
                style={styles.logo}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={MarkAbsent}
              style={styles.actionButtonCover}>
              <Image
                source={require('../../assets/icons/mark-absent.png')}
                style={styles.logo}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleViewDetails(cardRegister, id)}
              style={styles.actionButtonCover}>
              <Image
                source={require('../../assets/icons/eye.png')}
                style={styles.logo}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animatable.View>
  );
};

export default Card;
