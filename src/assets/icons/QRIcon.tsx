import React from 'react';
import Svg, {Rect, G} from 'react-native-svg';

interface QRIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const QRIcon: React.FC<QRIconProps> = ({
  width = 24,
  height = 24,
  color = '#000',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Top left corner - detection pattern */}
      <G>
        <Rect x="1" y="1" width="7" height="7" fill={color} />
        <Rect x="2" y="2" width="5" height="5" fill="white" />
        <Rect x="3" y="3" width="3" height="3" fill={color} />
      </G>
      
      {/* Top right corner - detection pattern */}
      <G>
        <Rect x="16" y="1" width="7" height="7" fill={color} />
        <Rect x="17" y="2" width="5" height="5" fill="white" />
        <Rect x="18" y="3" width="3" height="3" fill={color} />
      </G>
      
      {/* Bottom left corner - detection pattern */}
      <G>
        <Rect x="1" y="16" width="7" height="7" fill={color} />
        <Rect x="2" y="17" width="5" height="5" fill="white" />
        <Rect x="3" y="18" width="3" height="3" fill={color} />
      </G>
      
      {/* Timing patterns and data modules */}
      <Rect x="10" y="1" width="1" height="1" fill={color} />
      <Rect x="12" y="1" width="1" height="1" fill={color} />
      <Rect x="14" y="1" width="1" height="1" fill={color} />
      
      <Rect x="1" y="10" width="1" height="1" fill={color} />
      <Rect x="1" y="12" width="1" height="1" fill={color} />
      <Rect x="1" y="14" width="1" height="1" fill={color} />
      
      {/* Data pattern simulation */}
      <Rect x="10" y="10" width="1" height="1" fill={color} />
      <Rect x="12" y="10" width="1" height="1" fill={color} />
      <Rect x="14" y="10" width="1" height="1" fill={color} />
      <Rect x="16" y="10" width="1" height="1" fill={color} />
      <Rect x="18" y="10" width="1" height="1" fill={color} />
      <Rect x="20" y="10" width="1" height="1" fill={color} />
      <Rect x="22" y="10" width="1" height="1" fill={color} />
      
      <Rect x="10" y="12" width="1" height="1" fill={color} />
      <Rect x="10" y="14" width="1" height="1" fill={color} />
      <Rect x="10" y="16" width="1" height="1" fill={color} />
      <Rect x="10" y="18" width="1" height="1" fill={color} />
      <Rect x="10" y="20" width="1" height="1" fill={color} />
      <Rect x="10" y="22" width="1" height="1" fill={color} />
      
      <Rect x="12" y="12" width="1" height="1" fill={color} />
      <Rect x="14" y="14" width="1" height="1" fill={color} />
      <Rect x="16" y="12" width="1" height="1" fill={color} />
      <Rect x="18" y="14" width="1" height="1" fill={color} />
      <Rect x="20" y="12" width="1" height="1" fill={color} />
      <Rect x="22" y="14" width="1" height="1" fill={color} />
      
      <Rect x="12" y="16" width="1" height="1" fill={color} />
      <Rect x="14" y="18" width="1" height="1" fill={color} />
      <Rect x="16" y="16" width="1" height="1" fill={color} />
      <Rect x="18" y="18" width="1" height="1" fill={color} />
      <Rect x="20" y="16" width="1" height="1" fill={color} />
      <Rect x="22" y="18" width="1" height="1" fill={color} />
      
      <Rect x="12" y="20" width="1" height="1" fill={color} />
      <Rect x="14" y="22" width="1" height="1" fill={color} />
      <Rect x="16" y="20" width="1" height="1" fill={color} />
      <Rect x="18" y="22" width="1" height="1" fill={color} />
      <Rect x="20" y="20" width="1" height="1" fill={color} />
      <Rect x="22" y="20" width="1" height="1" fill={color} />
    </Svg>
  );
};

export default QRIcon;
