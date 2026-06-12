import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { colors, layout, shadows } from '../styles/theme';

interface CrisisButtonProps {
  onPress?: () => void;
}

const PULSE_DURATION = 2000;
const BUTTON_SIZE = layout.crisisSize;

const CrisisButton: React.FC<CrisisButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  // Pulse animation - continuous
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.25, {
          duration: PULSE_DURATION / 2,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: PULSE_DURATION / 2,
          easing: Easing.in(Easing.ease),
        })
      ),
      -1,
      false
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {
          duration: PULSE_DURATION / 2,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0.4, {
          duration: PULSE_DURATION / 2,
          easing: Easing.in(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, [pulseScale, pulseOpacity]);

  // Press animation handlers
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, buttonAnimatedStyle]}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: colors.danger,
          },
          pulseAnimatedStyle,
        ]}
      />
      {/* Touchable button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
        accessibilityLabel="紧急求助"
        accessibilityRole="button"
        accessibilityHint="点击获取危机援助资源"
      >
        <Animated.View style={[styles.button, shadows.lg]}>
          <Animated.Text style={styles.emoji}>🆘</Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: layout.navHeight + 12,
    right: 16,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  touchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        elevation: 6,
      },
    }),
  },
  emoji: {
    fontSize: 26,
  },
});

export default CrisisButton;
