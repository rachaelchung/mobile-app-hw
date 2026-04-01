import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BootCursor } from "@/components/BootCursor";
import { MementoDetailModal } from "@/components/MementoDetailModal";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { colors, fonts, spacing } from "@/constants/theme";
import { useMementos } from "@/context/MementosContext";
import type { Memento } from "@/lib/mementos/types";

const COLS = 2;
const GAP = spacing.sm;
const SCREEN = Dimensions.get("window").width;
const TILE = (SCREEN - spacing.md * 2 - GAP) / COLS;

export default function MementosScreen() {
  const insets = useSafeAreaInsets();
  const { mementos, loading, error, reload, updateMemento, deleteMemento } =
    useMementos();
  const [selected, setSelected] = useState<Memento | null>(null);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.hotPink} />
        <Text style={styles.loadingLabel}>loading archive…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>mementos</Text>
        <BootCursor />
      </View>
      <Text style={styles.subtitle}>sorted by moment date · newest first</Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void reload()}>
            <Text style={styles.retry}>retry</Text>
          </Pressable>
        </View>
      ) : null}

      {mementos.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ScanlineOverlay opacity={0.03} />
          <Text style={styles.emptyIcon}>✦ ✿ ✦</Text>
          <Text style={styles.empty}>
            no memories captured yet. Get out there!
          </Text>
        </View>
      ) : (
        <FlatList
          data={mementos}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Image
                source={{ uri: item.photoPath }}
                style={styles.thumb}
                contentFit="cover"
              />
              <Text style={styles.tileTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.tileDate} numberOfLines={1}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}

      <MementoDetailModal
        visible={selected !== null}
        memento={selected}
        onClose={() => setSelected(null)}
        onSave={(id, payload) => updateMemento(id, payload)}
        onDelete={(id) => deleteMemento(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgShell,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.pixel,
    color: colors.hotPink,
    fontSize: 12,
    flex: 1,
  },
  subtitle: {
    fontFamily: fonts.rounded,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    width: TILE,
    backgroundColor: colors.bgPanel,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  thumb: {
    width: "100%",
    height: TILE * 0.85,
    backgroundColor: colors.bgDeep,
  },
  tileTitle: {
    fontFamily: fonts.roundedBold,
    color: colors.textPrimary,
    fontSize: 13,
    padding: spacing.sm,
    minHeight: 36,
  },
  tileDate: {
    fontFamily: fonts.handwritten,
    color: colors.softPurple,
    fontSize: 13,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  emptyWrap: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    position: "relative",
    overflow: "hidden",
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 22,
    color: colors.lilac,
  },
  empty: {
    fontFamily: fonts.rounded,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bgShell,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingLabel: {
    fontFamily: fonts.rounded,
    color: colors.textMuted,
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: 6,
  },
  errorText: {
    fontFamily: fonts.rounded,
    color: colors.error,
    fontSize: 13,
  },
  retry: {
    fontFamily: fonts.roundedBold,
    color: colors.hotPink,
    textDecorationLine: "underline",
    fontSize: 13,
  },
});
