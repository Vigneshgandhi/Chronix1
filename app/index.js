import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import NetworkPulse from "../src/components/splash/NetworkPulse";
import { colors } from "../src/constants/theme";

export default function SplashScreen() {
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.85)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(statusOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // NOTE: intentionally no auto-navigation yet. Once the Initial Storage
    // Allocation screen exists (next in the build sequence), this effect
    // will route to it after the sequence above completes, e.g.:
    //   const t = setTimeout(() => router.replace("/storage-setup"), 2600);
    //   return () => clearTimeout(t);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          opacity: pulseOpacity,
          transform: [{ scale: pulseScale }],
        }}
      >
        <NetworkPulse size={220} />
      </Animated.View>

      <Animated.Text
        style={{
          opacity: wordmarkOpacity,
          transform: [{ translateY: wordmarkTranslate }],
          color: colors.textPrimary,
          fontSize: 32,
          fontWeight: "700",
          letterSpacing: 6,
          marginTop: 8,
        }}
      >
        CHRONIX
      </Animated.Text>

      <Animated.Text
        style={{
          opacity: taglineOpacity,
          color: colors.textSecondary,
          fontSize: 14,
          letterSpacing: 0.5,
          marginTop: 10,
        }}
      >
        Your data. Your device. No servers.
      </Animated.Text>

      <Animated.View
        style={{
          opacity: statusOpacity,
          position: "absolute",
          bottom: 56,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 0.5,
          }}
        >
          Starting ChronixDB engine
        </Text>
      </Animated.View>
    </View>
  );
}
