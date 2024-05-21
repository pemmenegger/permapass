import { IconProps } from "../../types";
import Svg, { Path } from "react-native-svg";

export const ChevronLeftIcon = (props: IconProps) => {
  const width = 24;
  const height = 24;
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
        d="M15 18L9 12L15 6"
        stroke={props.color}
        strokeWidth={props.strokeWidth || 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
