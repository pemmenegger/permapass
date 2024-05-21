import { IconProps } from "../../types";
import Svg, { Path } from "react-native-svg";

export const PlusCircleIcon = (props: IconProps) => {
  const width = 22;
  const height = 22;
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
        d="M11 7V15M7 11H15M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z"
        stroke={props.color}
        strokeWidth={props.strokeWidth || 1}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
