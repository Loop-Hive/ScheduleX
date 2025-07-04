import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const ConicGradient = ({percentage}: {percentage: number}) => {
  const segments = 100; // Number of gradient segments
  const filledSegments = Math.round((percentage / 100) * segments);
  const radius = 50;

  const generatePath = (startAngle: number, endAngle: number) => {
    const startX = 50 + radius * Math.cos((Math.PI * startAngle) / 180);
    const startY = 50 - radius * Math.sin((Math.PI * startAngle) / 180);
    const endX = 50 + radius * Math.cos((Math.PI * endAngle) / 180);
    const endY = 50 - radius * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M50,50 L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
  };

  return (
    <View style={styles.gradient}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        {/* Filled Segments */}
        {[...Array(segments)].map((_, i) => {
          const startAngle = 3.6 * (i + 1) + 90;
          const endAngle = 3.6 * i + 90;
          const isFilled = i > segments - filledSegments;
          return (
            <Path
              key={i}
              d={generatePath(startAngle, endAngle)}
              fill={isFilled ? '#00C7E2' : '#171721'}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: 60,
    height: 60,
    position: 'absolute',
  },
});

export default ConicGradient;
