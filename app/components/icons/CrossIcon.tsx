import { IconProps } from "../../types";
import Svg, { Path } from "react-native-svg";

export const CrossIcon = (props: IconProps) => {
  const width = 14;
  const height = 14;
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
        d="M13 1L1 13M1 1L13 13"
        stroke={props.color}
        strokeWidth={props.strokeWidth || 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
