import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface SubjectIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const SubjectIcon: React.FC<SubjectIconProps> = ({
  width = 30,
  height = 30,
  color = '#9CA3AF',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 30H12C6.3435 30 3.5145 30 1.758 28.242C0.00149989 26.484 0 23.6565 0 18V12C0 6.3435 -1.78814e-07 3.5145 1.758 1.758C3.516 0.00149989 6.3585 0 12.045 0C12.954 0 13.6815 -6.14673e-08 14.295 0.0254999C14.275 0.1455 14.265 0.2675 14.265 0.3915L14.25 4.6425C14.25 6.288 14.25 7.743 14.4075 8.9145C14.5785 10.185 14.97 11.4555 16.008 12.4935C17.043 13.5285 18.315 13.9215 19.5855 14.0925C20.757 14.25 22.212 14.25 23.8575 14.25H29.9355C30 15.051 30 16.035 30 17.3445V18C30 23.6565 30 26.4855 28.242 28.242C26.484 29.9985 23.6565 30 18 30Z"
        fill={color}
      />
      <Path
        d="M26.028 8.42591L20.088 3.08141C18.3975 1.55891 17.553 0.796914 16.5135 0.399414L16.5 4.50041C16.5 8.03591 16.5 9.80441 17.598 10.9024C18.696 12.0004 20.4645 12.0004 24 12.0004H29.37C28.827 10.9444 27.852 10.0684 26.028 8.42591Z"
        fill={color}
      />
    </Svg>
  );
};

export default SubjectIcon;
