import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, spacing } from "@/constants/theme";

type Props = {
  visible: boolean;
  previewUri: string | null;
  onClose: () => void;
  onSubmit: (title: string, noteText: string) => Promise<void>;
};

export function SaveMementoModal({
  visible,
  previewUri,
  onClose,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setNote("");
      setSaving(false);
    }
  }, [visible, previewUri]);

  const canSave = title.trim().length > 0;

  /** Pinned to full-screen root (not the KAV content box) so it doesn’t jump when the keyboard opens */
  const bottomWashHeight = Math.max(Math.round(windowHeight * 0.52), 260);

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSubmit(title.trim(), note.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible && !!previewUri}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <View
          pointerEvents="none"
          style={[styles.bottomWash, { height: bottomWashHeight }]}
        />
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <ScrollView
            style={styles.scrollLayer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.sheetScrollContent}
          >
            <Pressable
              style={styles.sheetAboveTap}
              onPress={Keyboard.dismiss}
              accessibilityLabel="Dismiss keyboard"
              accessibilityRole="button"
            />
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, spacing.md) },
              ]}
            >
              <Text style={styles.header}>✦ new entry</Text>
              {previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.preview}
                  contentFit="cover"
                />
              ) : null}
              <Text style={styles.label}>title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Moment title"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <Text style={styles.label}>note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="A few words to remember…"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.noteInput]}
                multiline
              />
              <View style={styles.row}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.btn,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.btnGhostText}>cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => void handleSave()}
                  disabled={!canSave || saving}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnPrimary,
                    (!canSave || saving) && styles.btnDisabled,
                    pressed && canSave && !saving && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>
                    {saving ? "saving…" : "save ✦"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  bottomWash: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgPanel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 0,
  },
  kav: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  scrollLayer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  sheetScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  sheetAboveTap: {
    flexGrow: 1,
    minHeight: 48,
  },
  sheet: {
    backgroundColor: colors.bgPanel,
    borderTopWidth: 3,
    borderColor: colors.lilac,
    padding: spacing.md,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.sm,
  },
  header: {
    fontFamily: fonts.pixel,
    color: colors.hotPink,
    fontSize: 9,
    marginBottom: spacing.sm,
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.handwritten,
    color: colors.softPurple,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontFamily: fonts.rounded,
    fontSize: 15,
    backgroundColor: colors.bgDeep,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "flex-end",
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.hotPink,
    borderColor: colors.hotPink,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnGhostText: {
    fontFamily: fonts.roundedBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  btnPrimaryText: {
    fontFamily: fonts.roundedBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
