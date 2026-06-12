import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Svg, Circle, Line, Rect } from 'react-native-svg';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

// ========================
// Types
// ========================

interface Segment {
  text: string;
  duration: number; // seconds
  part?: string;
  phase?: string;
  audio?: string;
}

type PlayerType = 'breathing' | 'bodyScan' | 'meditation';

interface GuidedPlayerProps {
  visible: boolean;
  onClose: () => void;
  segments: Segment[];
  type: PlayerType;
  title: string;
}

// ========================
// Constants
// ========================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BREATHING_CIRCLE_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.45;
const BODY_PARTS = [
  '头顶', '额头', '眼睛', '脸颊', '下巴',
  '颈部', '肩膀', '上臂', '手肘', '前臂',
  '手腕', '手掌', '手指', '胸腔', '腹部',
  '背部', '臀部', '大腿', '膝盖', '小腿',
  '脚踝', '脚掌', '脚趾',
];

// ========================
// Component
// ========================

const GuidedPlayer: React.FC<GuidedPlayerProps> = ({
  visible,
  onClose,
  segments,
  type,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingScale = useSharedValue(0.6);
  const meditationPulse = useSharedValue(1);
  const bodyScanHighlight = useSharedValue(0);

  const currentSegment = segments[currentIndex] || null;

  // Calculate total duration
  useEffect(() => {
    const total = segments.reduce((sum, seg) => sum + seg.duration, 0);
    setTotalDuration(total);
  }, [segments]);

  // Reset when segments change
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setTimeRemaining(segments[0]?.duration || 0);
  }, [segments]);

  // Timer logic
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next segment
            if (currentIndex < segments.length - 1) {
              const nextIndex = currentIndex + 1;
              setCurrentIndex(nextIndex);
              return segments[nextIndex].duration;
            } else {
              // Finished all segments
              setIsPlaying(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, timeRemaining, currentIndex, segments]);

  // Breathing animation
  useEffect(() => {
    if (type === 'breathing' && isPlaying) {
      const breatheIn = currentSegment?.phase === 'inhale' || currentSegment?.text.includes('吸气') || currentSegment?.text.includes('吸入');
      const breatheOut = currentSegment?.phase === 'exhale' || currentSegment?.text.includes('呼气') || currentSegment?.text.includes('呼出');

      if (breatheIn) {
        breathingScale.value = withTiming(1, {
          duration: (currentSegment?.duration || 4) * 1000,
          easing: Easing.inOut(Easing.sin),
        });
      } else if (breatheOut) {
        breathingScale.value = withTiming(0.6, {
          duration: (currentSegment?.duration || 4) * 1000,
          easing: Easing.inOut(Easing.sin),
        });
      } else {
        // Hold
        breathingScale.value = withTiming(breathingScale.value, {
          duration: (currentSegment?.duration || 3) * 1000,
        });
      }
    } else if (type === 'breathing' && !isPlaying) {
      breathingScale.value = withTiming(0.75, { duration: 500 });
    }
  }, [type, isPlaying, currentIndex, currentSegment, breathingScale]);

  // Meditation pulse animation
  useEffect(() => {
    if (type === 'meditation' && isPlaying) {
      meditationPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.95, {
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        false
      );
    } else if (type === 'meditation') {
      meditationPulse.value = withTiming(1, { duration: 500 });
    }
  }, [type, isPlaying, meditationPulse]);

  // Body scan highlight
  useEffect(() => {
    if (type === 'bodyScan' && currentSegment) {
      const partIndex = BODY_PARTS.findIndex(
        (part) =>
          currentSegment.text.includes(part) ||
          currentSegment.part?.includes(part)
      );
      bodyScanHighlight.value = withTiming(
        partIndex >= 0 ? partIndex : 0,
        { duration: 600, easing: Easing.out(Easing.cubic) }
      );
    }
  }, [type, currentIndex, currentSegment, bodyScanHighlight]);

  // Controls
  const handlePlayPause = useCallback(() => {
    if (timeRemaining <= 0 && currentIndex >= segments.length - 1) {
      // Restart
      setCurrentIndex(0);
      setTimeRemaining(segments[0]?.duration || 0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [timeRemaining, currentIndex, segments]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setTimeRemaining(segments[0]?.duration || 0);
  }, [segments]);

  const handleSkipForward = useCallback(() => {
    if (currentIndex < segments.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeRemaining(segments[nextIndex].duration);
    }
  }, [currentIndex, segments]);

  const handleSkipBackward = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setTimeRemaining(segments[prevIndex].duration);
    }
  }, [currentIndex, segments]);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onClose();
  }, [onClose]);

  // Format time
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress calculation
  const elapsedTotal = segments
    .slice(0, currentIndex)
    .reduce((sum, seg) => sum + seg.duration, 0) +
    (segments[currentIndex]?.duration || 0) - timeRemaining;
  const progressPercent = totalDuration > 0 ? (elapsedTotal / totalDuration) * 100 : 0;

  // Animated styles
  const breathingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const meditationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: meditationPulse.value }],
    opacity: interpolate(
      meditationPulse.value,
      [0.95, 1.08],
      [0.7, 1],
      Extrapolation.CLAMP
    ),
  }));

  // Render type-specific visuals
  const renderTypeVisual = () => {
    if (type === 'breathing') {
      return (
        <Animated.View style={[styles.breathingCircle, breathingAnimatedStyle]}>
          <Svg
            width={BREATHING_CIRCLE_SIZE}
            height={BREATHING_CIRCLE_SIZE}
          >
            <Circle
              cx={BREATHING_CIRCLE_SIZE / 2}
              cy={BREATHING_CIRCLE_SIZE / 2}
              r={BREATHING_CIRCLE_SIZE / 2 - 4}
              fill="none"
              stroke={colors.primaryLight}
              strokeWidth={3}
              opacity={0.5}
            />
            <Circle
              cx={BREATHING_CIRCLE_SIZE / 2}
              cy={BREATHING_CIRCLE_SIZE / 2}
              r={BREATHING_CIRCLE_SIZE / 2 - 4}
              fill={colors.primaryLight}
              opacity={0.15}
            />
          </Svg>
          <View style={styles.breathingCenterText}>
            <Text style={styles.breathingInstruction}>
              {currentSegment?.phase === 'inhale' || currentSegment?.text.includes('吸气')
                ? '吸气...'
                : currentSegment?.phase === 'exhale' || currentSegment?.text.includes('呼气')
                  ? '呼气...'
                  : currentSegment?.phase === 'hold' || currentSegment?.text.includes('屏息')
                    ? '屏息...'
                    : ''}
            </Text>
          </View>
        </Animated.View>
      );
    }

    if (type === 'bodyScan') {
      return (
        <View style={styles.bodyScanContainer}>
          <Svg width={120} height={300} viewBox="0 0 120 300">
            {/* Simple body outline */}
            {/* Head */}
            <Circle cx="60" cy="25" r="18" fill="none" stroke={colors.border} strokeWidth="2" />
            {/* Neck */}
            <Line x1="60" y1="43" x2="60" y2="55" stroke={colors.border} strokeWidth="2" />
            {/* Body */}
            <Rect x="35" y="55" width="50" height="70" rx="8" fill="none" stroke={colors.border} strokeWidth="2" />
            {/* Left arm */}
            <Line x1="35" y1="60" x2="15" y2="120" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
            {/* Right arm */}
            <Line x1="85" y1="60" x2="105" y2="120" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
            {/* Left leg */}
            <Line x1="45" y1="125" x2="38" y2="230" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
            {/* Right leg */}
            <Line x1="75" y1="125" x2="82" y2="230" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
            {/* Left foot */}
            <Line x1="38" y1="230" x2="30" y2="250" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
            {/* Right foot */}
            <Line x1="82" y1="230" x2="90" y2="250" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <View style={styles.bodyPartLabel}>
            <Text style={styles.bodyPartLabelText}>
              {currentSegment?.part || BODY_PARTS[currentIndex % BODY_PARTS.length]}
            </Text>
          </View>
        </View>
      );
    }

    if (type === 'meditation') {
      return (
        <Animated.View style={[styles.meditationCircle, meditationAnimatedStyle]}>
          <View style={styles.meditationInner} />
          <View style={styles.meditationMiddle} />
          <View style={styles.meditationOuter} />
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Type visual */}
          {renderTypeVisual()}

          {/* Segment text */}
          <View style={styles.segmentTextBox}>
            <Text style={styles.segmentText} key={currentIndex}>
              {currentSegment?.text || ''}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressTime}>
              {formatTime(elapsedTotal)} / {formatTime(totalDuration)}
            </Text>
          </View>

          {/* Segment dots */}
          <View style={styles.dotsContainer}>
            {segments.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                  index < currentIndex && styles.dotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSkipBackward}
            disabled={currentIndex === 0}
          >
            <Text style={[
              styles.controlIcon,
              currentIndex === 0 && styles.controlIconDisabled,
            ]}>
              ⏮
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
            <Text style={styles.controlIcon}>⏹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSkipForward}
            disabled={currentIndex >= segments.length - 1}
          >
            <Text style={[
              styles.controlIcon,
              currentIndex >= segments.length - 1 && styles.controlIconDisabled,
            ]}>
              ⏭
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ========================
// Styles
// ========================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: typography.fontFamily,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  // Breathing
  breathingCircle: {
    width: BREATHING_CIRCLE_SIZE,
    height: BREATHING_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  breathingCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingInstruction: {
    fontSize: 20,
    color: colors.primaryLight,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  // Body scan
  bodyScanContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bodyPartLabel: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
  },
  bodyPartLabelText: {
    fontSize: 16,
    color: colors.accentLight,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  // Meditation
  meditationCircle: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  meditationInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    opacity: 0.8,
  },
  meditationMiddle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    opacity: 0.4,
  },
  meditationOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    opacity: 0.2,
  },
  // Segment text
  segmentTextBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginBottom: spacing.lg,
  },
  segmentText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Progress
  progressContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
  },
  progressTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  // Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: colors.primaryLight,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotCompleted: {
    backgroundColor: 'rgba(168, 204, 232, 0.5)',
  },
  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  controlIconDisabled: {
    opacity: 0.3,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: { elevation: 4 },
      ios: { ...shadows.md },
    }),
  },
  playIcon: {
    fontSize: 26,
    color: '#FFFFFF',
  },
});

export default GuidedPlayer;
