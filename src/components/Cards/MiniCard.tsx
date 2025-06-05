import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import styles from '../../styles/CardStyles';
import MiniConicGradient from './MiniConicGradient';
import useStore from '../../store/store';
interface CardProps {
  id: number;
  title: string;
  present: number;
  total: number;
  target_percentage: number;
  tagColor: string;
  cardRegister: number;
  handleMenuOpen: (r: number, c: number) => void;
}
const MiniCard: React.FC<CardProps> = ({
  id,
  title,
  present,
  total,
  target_percentage,
  tagColor,
  cardRegister,
  handleMenuOpen,
}) => {
  const {markPresent, markAbsent} = useStore();
  const [percentage, setPercentage] = useState(0);
  const [cardColor, setCardColor] = useState('#892B2B');
  const [cardPresents, setCardPresents] = useState(present);
  const [cardTotals, setCardTotals] = useState(total);

  const MarkPresent = () => {
    setCardPresents(prev => prev + 1);
    setCardTotals(prev => prev + 1);
    markPresent(cardRegister, id);
  };
  const MarkAbsent = () => {
    setCardTotals(prev => prev + 1);
    markAbsent(cardRegister, id);
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
    <View style={[styles.cardContainer, {backgroundColor: cardColor}]}>
      <View style={styles.miniHeader}>
        <View style={[styles.miniIndicator, {backgroundColor: tagColor}]} />

        <Text style={styles.miniHeaderTitle}>
          {title.length > 8 ? title.substring(0, 8) + '..' : title}
        </Text>
      </View>
      <View>
        <Text style={styles.miniAttendanceCount}>
          {cardPresents}/{cardTotals}
        </Text>
      </View>
      <View style={styles.miniCircularContainer}>
        <View
          style={[styles.miniCircularProgress, {backgroundColor: cardColor}]}>
          <Text style={styles.miniPercentageText}>{percentage}%</Text>
        </View>
        <MiniConicGradient percentage={percentage + 1} />
      </View>
      <TouchableOpacity
        style={styles.miniThreeDot}
        onPress={() => handleMenuOpen(cardRegister, id)}>
        <Image
          source={require('../../assets/icons/three-dot.png')}
          style={styles.threeDot}
        />
      </TouchableOpacity>
      <View style={styles.miniActionButtons}>
        <TouchableOpacity onPress={MarkPresent}>
          <Image
            source={require('../../assets/icons/mark-present.png')}
            style={styles.miniLogo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={MarkAbsent}>
          <Image
            source={require('../../assets/icons/mark-absent.png')}
            style={styles.miniLogo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MiniCard;
