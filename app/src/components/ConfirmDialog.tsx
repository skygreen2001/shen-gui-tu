import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, shadows } from '../styles/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  danger = true,
}) => {
  const backdropOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(100);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  const showAnimation = useCallback(() => {
    'worklet';
    backdropOpacity.value = withTiming(1, { duration: 250 });
    cardTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
    cardScale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.back(1.2)) });
    cardOpacity.value = withTiming(1, { duration: 200 });
  }, [backdropOpacity, cardTranslateY, cardScale, cardOpacity]);

  const hideAnimation = useCallback(() => {
    'worklet';
    backdropOpacity.value = withTiming(0, { duration: 200 });
    cardTranslateY.value = withTiming(80, { duration: 200, easing: Easing.in(Easing.cubic) });
    cardScale.value = withTiming(0.9, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 150 });
  }, [backdropOpacity, cardTranslateY, cardScale, cardOpacity]);

  useEffect(() => {
    if (visible) {
      showAnimation();
    } else {
      hideAnimation();
    }
  }, [visible, showAnimation, hideAnimation]);

  const handleConfirm = () => {
    hideAnimation();
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  const handleCancel = () => {
    hideAnimation();
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  const handleBackdropPress = () => {
    handleCancel();
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cardTranslateY.value },
        { scale: cardScale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
          <View style={styles.card}>
            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <View style={styles.buttonDivider} />

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  danger && styles.confirmButtonDanger,
                ]}
                activeOpacity={0.7}
                onPress={handleConfirm}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    danger && styles.confirmButtonTextDanger,
                  ]}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropTouchable: {
    flex: 1,
  },
  cardContainer: {
    width: '80%',
    maxWidth: 340,
    marginHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    height: 50,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  buttonDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  confirmButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  confirmButtonDanger: {
    backgroundColor: colors.danger + '10',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: typography.fontFamily,
  },
  confirmButtonTextDanger: {
    color: colors.danger,
  },
});

export default ConfirmDialog;
