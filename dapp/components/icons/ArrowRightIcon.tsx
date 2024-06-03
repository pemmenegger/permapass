import { IconProps } from "../../types";
import Svg, { Path } from "react-native-svg";

export const ArrowRightIcon = (props: IconProps) => {
  const width = 16;
  const height = 16;
  const aspectRatio = width / height;

  return (
    <Svg
      width={props.height * aspectRatio}
      height={props.height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <Path
        d="M1 8H15M15 8L8 1M15 8L8 15"
        stroke={props.color}
        strokeWidth={props.strokeWidth || 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
