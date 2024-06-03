import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "../../types";

export const LoadingSpinnerIcon = (props: IconProps) => {
  const width = 22;
  const height = 22;
  const aspectRatio = width / height;

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
          width: props.height * aspectRatio,
          height: props.height,
        }}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <Path
            d="M11 1V5M11 17V21M5 11H1M21 11H17M18.0784 18.0784L15.25 15.25M18.0784 3.99994L15.25 6.82837M3.92157 18.0784L6.75 15.25M3.92157 3.99994L6.75 6.82837"
            stroke={props.color}
            strokeWidth={props.strokeWidth || 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};
