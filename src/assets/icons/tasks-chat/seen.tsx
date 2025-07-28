import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface SeenIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const SeenIcon: React.FC<SeenIconProps> = ({
  width = 18,
  height = 18,
  color = '#B8B6B6',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path
        d="M0.308594 10.0576L4.50109 14.2501L5.55859 13.1851L1.37359 9.00006M16.6811 4.18506L8.74609 12.1276L5.62609 9.00006L4.55359 10.0576L8.74609 14.2501L17.7461 5.25006M13.5011 5.25006L12.4436 4.18506L7.68109 8.94756L8.74609 10.0051L13.5011 5.25006Z"
        fill={color}
      />
    </Svg>
  );
};

export default SeenIcon;
