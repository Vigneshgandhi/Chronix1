import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { colors } from "../../constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// Node layout: node 0 is "this device" (center, larger, primary color).
// Nodes 1-5 are peers arranged in an irregular ring — irregular on purpose,
// a real mesh never looks like a perfect polygon.
const CENTER = { x: 150, y: 150 };
const NODES = [
  { id: 0, x: 150, y: 150, r: 7, isSelf: true },
  { id: 1, x: 78, y: 96, r: 4 },
  { id: 2, x: 214, y: 70, r: 3.5 },
  { id: 3, x: 236, y: 176, r: 4.5 },
  { id: 4, x: 168, y: 234, r: 3.5 },
  { id: 5, x: 66, y: 200, r: 4 },
];

// Which peers are "connected" to the center right now — not every node,
// because a real network doesn't have every peer online at once.
const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 5],
];

export default function NetworkPulse({ size = 220 }) {
  const nodeAnims = useRef(NODES.map(() => new Animated.Value(0))).current;
  const edgeAnims = useRef(EDGES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const nodeLoops = nodeAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 220),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    const edgeLoops = edgeAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(300 + i * 260),
          Animated.timing(anim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    [...nodeLoops, ...edgeLoops].forEach((loop) => loop.start());
    return () => [...nodeLoops, ...edgeLoops].forEach((loop) => loop.stop());
  }, [nodeAnims, edgeAnims]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        {EDGES.map(([fromId, toId], i) => {
          const from = NODES.find((n) => n.id === fromId);
          const to = NODES.find((n) => n.id === toId);
          return (
            <AnimatedLine
              key={`edge-${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={colors.primaryGlow}
              strokeWidth={1.25}
              opacity={edgeAnims[i]}
            />
          );
        })}

        {NODES.map((node, i) => (
          <AnimatedCircle
            key={`node-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.isSelf ? colors.primary : colors.textSecondary}
            opacity={nodeAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            })}
          />
        ))}
      </Svg>
    </View>
  );
}
