import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import { wrapSections as defaultSections, WrapSection } from '../data/wrapTemplate';
import useAsyncStorage from '../hooks/useAsyncStorage';

// ========================
// Component
// ========================

export default function WRAPPlan() {
  const [sections, setSections] = useAsyncStorage<WrapSection[]>(
    'sgt-wrap-sections',
    defaultSections,
  );
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    sectionId: string;
    itemIdx: number;
  } | null>(null);

  const togglePanel = useCallback((id: string) => {
    setOpenPanel((prev) => (prev === id ? null : id));
  }, []);

  const removeItem = useCallback(
    (sectionId: string, itemIdx: number) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            return {
              ...s,
              items: s.items.filter((_, i) => i !== itemIdx),
            };
          }
          return s;
        }),
      );
    },
    [setSections],
  );

  const addItem = useCallback(
    (sectionId: string) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            return { ...s, items: [...s.items, '新条目'] };
          }
          return s;
        }),
      );
      // Auto-open the panel and start editing the new item
      setOpenPanel(sectionId);
      setTimeout(() => {
        const section = sections.find((s) => s.id === sectionId);
        if (section) {
          setEditingItem({
            sectionId,
            itemIdx: section.items.length, // New item will be at this index
          });
        }
      }, 100);
    },
    [setSections, sections],
  );

  const updateItem = useCallback(
    (sectionId: string, itemIdx: number, value: string) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            const newItems = [...s.items];
            newItems[itemIdx] = value;
            return { ...s, items: newItems };
          }
          return s;
        }),
      );
    },
    [setSections],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WRAP计划</Text>
        <Text style={styles.headerSub}>个人康复行动计划</Text>
      </View>

      {/* Accordion Sections */}
      {sections.map((section) => {
        const isOpen = openPanel === section.id;
        const itemCount = section.items.length;

        return (
          <View
            key={section.id}
            style={[styles.panel, isOpen && styles.panelOpen]}
          >
            {/* Panel Header */}
            <TouchableOpacity
              style={styles.panelHeader}
              activeOpacity={0.7}
              onPress={() => togglePanel(section.id)}
            >
              <Text style={styles.panelTitle}>{section.title}</Text>
              <View style={styles.panelMeta}>
                <Text style={styles.panelCount}>{itemCount} 项</Text>
                <Text
                  style={[
                    styles.panelArrow,
                    isOpen && styles.panelArrowOpen,
                  ]}
                >
                  ▼
                </Text>
              </View>
            </TouchableOpacity>

            {/* Panel Body */}
            {isOpen && (
              <View style={styles.panelBody}>
                <Text style={styles.hint}>{section.hint}</Text>

                {/* Items */}
                {section.items.map((item, idx) => {
                  const isEditing =
                    editingItem?.sectionId === section.id &&
                    editingItem?.itemIdx === idx;

                  return (
                    <View key={idx} style={styles.item}>
                      {isEditing ? (
                        <TextInput
                          style={styles.itemInput}
                          value={item}
                          onChangeText={(value) =>
                            updateItem(section.id, idx, value)
                          }
                          onBlur={() => setEditingItem(null)}
                          onSubmitEditing={() => setEditingItem(null)}
                          autoFocus
                          returnKeyType="done"
                        />
                      ) : (
                        <TouchableOpacity
                          style={styles.itemContent}
                          activeOpacity={0.7}
                          onPress={() =>
                            setEditingItem({ sectionId: section.id, itemIdx: idx })
                          }
                        >
                          <Text style={styles.itemText} numberOfLines={2}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.itemDelete}
                        onPress={() => removeItem(section.id, idx)}
                      >
                        <Text style={styles.itemDeleteText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Add Button */}
                <TouchableOpacity
                  style={styles.addBtn}
                  activeOpacity={0.7}
                  onPress={() => addItem(section.id)}
                >
                  <Text style={styles.addBtnText}>+ 添加条目</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          WRAP（Wellness Recovery Action Plan）是由 Mary Ellen Copeland 博士开发的
        </Text>
        <Text style={styles.footerText}>
          个人康复行动计划，已被全球广泛用于心理健康自我管理。
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

  // Accordion Panel
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  panelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  panelCount: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
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

  // Hint
  hint: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textHint,
    marginBottom: spacing.md,
    lineHeight: 18,
  },

  // Items
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemContent: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  itemText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  itemInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 40,
  },
  itemDelete: {
    padding: spacing.sm,
    paddingRight: spacing.md,
  },
  itemDeleteText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
  },

  // Add Button
  addBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Footer
  footer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
