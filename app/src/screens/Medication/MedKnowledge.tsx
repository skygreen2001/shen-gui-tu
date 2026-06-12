import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../../styles/theme';
import { getMedInfo, medicationDB, MedicationInfo } from '../../data/medicationKnowledge';

// ========================
// Types
// ========================

interface SectionConfig {
  key: keyof MedicationInfo | 'missedDose';
  label: string;
  type?: 'list';
}

// ========================
// Constants
// ========================

const sections: SectionConfig[] = [
  { key: 'category', label: '💊 药物分类' },
  { key: 'mechanism', label: '🔬 作用机制' },
  { key: 'onsetTime', label: '⏰ 起效时间' },
  { key: 'sideEffects', label: '⚠️ 常见副作用', type: 'list' },
  { key: 'tips', label: '💡 注意事项', type: 'list' },
  { key: 'missedDose', label: '📋 漏服建议' },
];

// ========================
// Component
// ========================

interface MedKnowledgeProps {
  name?: string;
  onBack?: () => void;
}

export default function MedKnowledge({ name, onBack }: MedKnowledgeProps) {
  const [selectedDrug, setSelectedDrug] = useState<string | null>(name || null);
  const [openKey, setOpenKey] = useState<string | null>('mechanism');

  const info = selectedDrug ? getMedInfo(selectedDrug) : null;
  const drugNames = Object.keys(medicationDB);

  // Drug selection list
  if (!selectedDrug) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backBtnText}>← 返回</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>药物知识库</Text>
          <Text style={styles.headerSub}>了解你正在服用的药物</Text>
        </View>

        <View style={styles.drugList}>
          {drugNames.map((drugName) => (
            <TouchableOpacity
              key={drugName}
              style={styles.drugCard}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedDrug(drugName);
                setOpenKey('mechanism');
              }}
            >
              <Text style={styles.drugIcon}>💊</Text>
              <View style={styles.drugInfo}>
                <Text style={styles.drugName}>{drugName}</Text>
                <Text style={styles.drugCategory}>
                  {medicationDB[drugName].category}
                </Text>
              </View>
              <Text style={styles.drugArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚕️ 以上信息仅供参考，具体请遵医嘱。如有疑问请咨询您的主治医生。
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  // Drug detail view
  if (!info) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (onBack) {
                onBack();
              } else {
                setSelectedDrug(null);
              }
            }}
          >
            <Text style={styles.backBtnText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDrug}</Text>
        </View>

        <View style={styles.emptyView}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>暂未收录该药物</Text>
          <Text style={styles.emptyDesc}>建议咨询您的主治医生了解详情</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              setSelectedDrug(null);
            }
          }}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDrug}</Text>
        <Text style={styles.headerSub}>{info.category}</Text>
      </View>

      {/* Accordion Panels */}
      {sections.map((sec) => {
        const value =
          sec.key === 'missedDose' ? info.missedDoseAdvice : info[sec.key];
        if (!value) return null;
        const isOpen = openKey === sec.key;

        return (
          <View
            key={sec.key}
            style={[styles.panel, isOpen && styles.panelOpen]}
          >
            <TouchableOpacity
              style={styles.panelHeader}
              activeOpacity={0.7}
              onPress={() => setOpenKey(isOpen ? null : sec.key)}
            >
              <Text style={styles.panelTitle}>{sec.label}</Text>
              <Text
                style={[
                  styles.panelArrow,
                  isOpen && styles.panelArrowOpen,
                ]}
              >
                ▼
              </Text>
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.panelBody}>
                {sec.type === 'list' && Array.isArray(value) ? (
                  <View style={styles.list}>
                    {value.map((item: string, i: number) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.listBullet}>•</Text>
                        <Text style={styles.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.panelContent}>
                    {value as string}
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚕️ 以上信息仅供参考，具体请遵医嘱。如有疑问请咨询您的主治医生。
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ========================
// Styles
// ========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Drug List
  drugList: {
    gap: spacing.sm,
  },
  drugCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  drugIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  drugCategory: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  drugArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
  },

  // Empty State
  emptyView: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Accordion Panels
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  panelOpen: {
    ...shadows.md,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  panelTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  panelArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  panelArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  panelBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  panelContent: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // List
  list: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listBullet: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Disclaimer
  disclaimer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
  },
  disclaimerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
