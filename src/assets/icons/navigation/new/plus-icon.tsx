import React from 'react';
import Svg, {
  G,
  Path,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
} from 'react-native-svg';

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({
  width = 35,
  height = 36,
  color = 'white',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 35 36" fill="none">
      <G filter="url(#filter0_d_1019_3311)">
        <Path
          d="M19.4747 3.09519C19.4747 1.75371 18.3909 0.669922 17.0494 0.669922C15.7079 0.669922 14.6241 1.75371 14.6241 3.09519V14.0089H3.71042C2.36895 14.0089 1.28516 15.0927 1.28516 16.4342C1.28516 17.7756 2.36895 18.8594 3.71042 18.8594H14.6241V29.7731C14.6241 31.1146 15.7079 32.1984 17.0494 32.1984C18.3909 32.1984 19.4747 31.1146 19.4747 29.7731V18.8594H30.3884C31.7298 18.8594 32.8136 17.7756 32.8136 16.4342C32.8136 15.0927 31.7298 14.0089 30.3884 14.0089H19.4747V3.09519Z"
          fill={color}
        />
      </G>
      <Defs>
        <Filter
          id="filter0_d_1019_3311"
          x="-2.71484"
          y="0.669922"
          width="39.5273"
          height="39.5283"
          filterUnits="userSpaceOnUse">
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset dy="4" />
          <FeGaussianBlur stdDeviation="2" />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <FeBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1019_3311"
          />
          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1019_3311"
            result="shape"
          />
        </Filter>
      </Defs>
    </Svg>
  );
};

export default PlusIcon;
