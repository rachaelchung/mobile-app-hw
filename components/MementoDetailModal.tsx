import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, spacing } from "@/constants/theme";
import type { Memento } from "@/lib/mementos/types";

type Props = {
  visible: boolean;
  memento: Memento | null;
  onClose: () => void;
  onSave: (
    id: number,
    payload: { title: string; noteText: string; date: string },
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function MementoDetailModal({
  visible,
  memento,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memento) {
      setTitle(memento.title);
      setNote(memento.noteText);
      setDate(new Date(memento.date));
    }
    setShowPicker(false);
    setSaving(false);
  }, [memento, visible]);

  if (!memento) return null;

  const m = memento;

  const displayDate = date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function handleSave() {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    try {
      await onSave(m.id, {
        title: t,
        noteText: note,
        date: date.toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete memento?",
      "This removes the note and image file.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              await onDelete(m.id);
              onClose();
            })();
          },
        },
      ],
    );
  }

  const canSave = title.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { marginBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <Text style={styles.header}>✦ memory file #{m.id}</Text>
          <Image
            source={{ uri: m.photoPath }}
            style={styles.preview}
            contentFit="cover"
          />
          <Text style={styles.meta}>
            saved {new Date(m.createdAt).toLocaleString()}
          </Text>

          <Text style={styles.label}>title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>when (display date)</Text>
          <Pressable
            onPress={() => setShowPicker((s) => !s)}
            style={({ pressed }) => [
              styles.dateBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.dateBtnText}>{displayDate}</Text>
            <Text style={styles.hint}>tap to change ✦</Text>
          </Pressable>
          {showPicker ? (
            <View>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(ev, selected) => {
                  if (ev.type === "dismissed") {
                    setShowPicker(false);
                    return;
                  }
                  if (selected) setDate(selected);
                  if (Platform.OS === "android") setShowPicker(false);
                }}
              />
              {Platform.OS === "ios" ? (
                <Pressable
                  onPress={() => setShowPicker(false)}
                  style={styles.iosPickerDone}
                >
                  <Text style={styles.iosPickerDoneText}>done ✓</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.label}>note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.noteInput]}
            multiline
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.row}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            >
              <Text style={styles.btnGhost}>close</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleSave()}
              disabled={!canSave || saving}
              style={({ pressed }) => [
                styles.btn,
                styles.primary,
                (!canSave || saving) && styles.disabled,
                pressed && canSave && !saving && styles.pressed,
              ]}
            >
              <Text style={styles.btnPrimaryText}>{saving ? "…" : "save ✦"}</Text>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              style={({ pressed }) => [styles.btn, styles.danger, pressed && styles.pressed]}
            >
              <Text style={styles.btnDanger}>delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(45,31,94,0.80)",
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderWidth: 3,
    borderColor: colors.lilac,
    borderRadius: 24,
    padding: spacing.md,
    maxHeight: "92%",
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    fontFamily: fonts.pixel,
    color: colors.hotPink,
    fontSize: 9,
    marginBottom: spacing.sm,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  meta: {
    fontFamily: fonts.handwritten,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
    padding: spacing.sm,
    borderRadius: 12,
    color: colors.textPrimary,
    fontFamily: fonts.rounded,
    fontSize: 15,
    backgroundColor: colors.bgDeep,
  },
  noteInput: { minHeight: 72, textAlignVertical: "top" },
  dateBtn: {
    borderWidth: 2,
    borderColor: colors.hotPink,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.bgDeep,
  },
  dateBtnText: {
    fontFamily: fonts.rounded,
    color: colors.textPrimary,
    fontSize: 15,
  },
  hint: {
    fontFamily: fonts.handwritten,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  primary: {
    borderColor: colors.hotPink,
    backgroundColor: colors.hotPink,
  },
  danger: {
    borderColor: colors.error,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  btnGhost: {
    fontFamily: fonts.roundedBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  btnPrimaryText: {
    fontFamily: fonts.roundedBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  btnDanger: {
    fontFamily: fonts.roundedBold,
    fontSize: 13,
    color: colors.error,
  },
  iosPickerDone: {
    alignSelf: "flex-end",
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  iosPickerDoneText: {
    fontFamily: fonts.roundedBold,
    fontSize: 14,
    color: colors.hotPink,
  },
});
