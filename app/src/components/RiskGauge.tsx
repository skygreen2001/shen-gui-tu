import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography } from '../styles/theme';

type RiskLevel = 'green' | 'yellow' | 'orange' | 'red' | 'unknown';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  color?: string;
  label?: string;
  size?: number;
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
  green: '#6BAF7A',
  yellow: '#E8C95A',
  orange: '#E8985E',
  red: '#D46B6B',
  unknown: '#E8E4DE',
};

const LEVEL_LABELS: Record<RiskLevel, string> = {
  green: '低风险',
  yellow: '中等风险',
  orange: '较高风险',
  red: '高风险',
  unknown: '未评估',
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  color,
  label,
  size = 180,
}) => {
  const strokeWidth = Math.max(size * 0.08, 10);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const fontSize = Math.max(size * 0.22, 24);
  const labelFontSize = Math.max(size * 0.09, 12);
  const scoreColor = color || LEVEL_COLORS[level];
  const displayLabel = label || LEVEL_LABELS[level];
  const clampedScore = Math.max(0, Math.min(100, score));

  const progress = useSharedValue(0);
  const displayScore = useSharedValue(0);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(displayScore.value)}`,
    };
  });

  const animateScore = useCallback(() => {
    'worklet';
    displayScore.value = withTiming(clampedScore, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedScore, displayScore]);

  useEffect(() => {
    progress.value = withDelay(
      200,
      withTiming(clampedScore / 100, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
    displayScore.value = 0;
    displayScore.value = withDelay(
      200,
      withTiming(clampedScore, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [clampedScore, progress, displayScore]);

  return (
    <View style={[styles.container, { width: size, height: size + 40 }]}>
      <Svg width={size} height={size}>
        {/* Background circle (track) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
        {/* Score text */}
        <AnimatedText
          x={center}
          y={center - fontSize * 0.15}
          fontSize={fontSize}
          fontWeight="700"
          fill={colors.textPrimary}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={typography.fontFamily}
          animatedProps={animatedTextProps}
        />
        {/* Unit text */}
        <SvgText
          x={center}
          y={center + fontSize * 0.6}
          fontSize={fontSize * 0.35}
          fill={colors.textSecondary}
          textAnchor="middle"
          fontFamily={typography.fontFamily}
        >
          分
        </SvgText>
      </Svg>
      {/* Level label */}
      <View
        style={[
          styles.labelContainer,
          { backgroundColor: scoreColor + '18' },
        ]}
      >
        <View
          style={[styles.labelDot, { backgroundColor: scoreColor }]}
        />
        <Animated.Text
          style={[
            styles.labelText,
            { color: scoreColor, fontSize: labelFontSize },
          ]}
        >
          {displayLabel}
        </Animated.Text>
      </View>
    </View>
  );
};

// Animated SVG Text component
interface AnimatedTextProps {
  animatedProps: any;
  [key: string]: any;
}

const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

const AnimatedText: React.FC<AnimatedTextProps> = (props) => {
  return <AnimatedSvgText {...props} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  labelText: {
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
});

export default RiskGauge;
