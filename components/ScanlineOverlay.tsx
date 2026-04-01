import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/theme";

export function ScanlineOverlay({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <View style={[styles.wrap, { opacity }]} pointerEvents="none">
      {Array.from({ length: 28 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            { top: i * 8, backgroundColor: colors.hotPink },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
});
