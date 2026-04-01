import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { colors, fonts } from "@/constants/theme";

export function BootCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <Text style={[styles.cursor, { opacity: on ? 1 : 0 }]} accessibilityLabel="cursor">
      ✦
    </Text>
  );
}

const styles = StyleSheet.create({
  cursor: {
    color: colors.hotPink,
    fontFamily: fonts.rounded,
    fontSize: 16,
  },
});
