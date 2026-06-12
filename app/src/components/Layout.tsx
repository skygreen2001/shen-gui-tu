import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../styles/theme';
import CrisisButton from './CrisisButton';

interface LayoutProps {
  children: ReactNode;
  showCrisisButton?: boolean;
  style?: ViewStyle;
  onCrisisPress?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showCrisisButton = true,
  style,
  onCrisisPress,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.bg}
        translucent={Platform.OS === 'android'}
      />
      <ScrollView
        style={[styles.scrollView, style]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        <View style={styles.container}>{children}</View>
      </ScrollView>
      {showCrisisButton && <CrisisButton onPress={onCrisisPress} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: layout.navHeight + layout.crisisSize + 24,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
});

export default Layout;
