import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BootCursor } from "@/components/BootCursor";
import { SaveMementoModal } from "@/components/SaveMementoModal";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { colors, fonts, spacing } from "@/constants/theme";
import { useMementos } from "@/context/MementosContext";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const { addMemento } = useMementos();
  const camRef = useRef<InstanceType<typeof CameraView>>(null);
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [libPermission, requestLibPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const camGranted = camPermission?.granted ?? false;
  const libGranted = libPermission?.granted ?? false;
  const camDenied = camPermission?.status === "denied";
  const libDenied = libPermission?.status === "denied";
  const bothBlocked = camDenied && libDenied;

  const openLibrary = useCallback(async () => {
    if (!libGranted) {
      const res = await requestLibPermission();
      if (!res.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setDraftUri(result.assets[0].uri);
      setFormOpen(true);
    }
  }, [libGranted, requestLibPermission]);

  const showCameraErrorAlert = useCallback(
    (msg: string) => {
      const permissionHint = /permission|not granted|access denied|could not be rendered/i.test(
        msg
      );
      Alert.alert("Camera", msg, [
        { text: "OK", style: "cancel" },
        ...(permissionHint
          ? [
              {
                text: "Allow access",
                onPress: () => {
                  void requestCamPermission();
                },
              },
              {
                text: "Settings",
                onPress: () => {
                  void Linking.openSettings();
                },
              },
            ]
          : []),
      ]);
    },
    [requestCamPermission]
  );

  const onCameraMountError = useCallback(
    (event: { message: string }) => {
      setCameraReady(false);
      showCameraErrorAlert(
        event.message || "The camera could not be started."
      );
    },
    [showCameraErrorAlert]
  );

  const toggleCameraFacing = useCallback(() => {
    if (!camGranted) return;
    // Do not clear cameraReady here: on iOS, `onCameraReady` only runs after the
    // initial session start, not when switching `facing` (lens swap only).
    setCameraFacing((f) => (f === "back" ? "front" : "back"));
  }, [camGranted]);

  const capturePhoto = useCallback(async () => {
    if (!camGranted || !cameraReady || capturing) return;
    setCapturing(true);
    try {
      const photo = await camRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setDraftUri(photo.uri);
        setFormOpen(true);
      } else {
        showCameraErrorAlert(
          "Could not capture a photo. Try again or check camera access in Settings."
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showCameraErrorAlert(msg);
    } finally {
      setCapturing(false);
    }
  }, [camGranted, cameraReady, capturing, showCameraErrorAlert]);

  async function onSaveMemento(title: string, noteText: string) {
    if (!draftUri) return;
    await addMemento(draftUri, title, noteText);
    setDraftUri(null);
  }

  function closeForm() {
    setFormOpen(false);
    setDraftUri(null);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <Text style={styles.brand}>Remember the Time…</Text>
        <BootCursor />
      </View>
      <Text style={styles.sub}>digicam-01 ✦ local memory vault</Text>

      {bothBlocked ? (
        <View style={styles.centeredBlock}>
          <Ionicons name="warning-outline" size={40} color={colors.error} />
          <Text style={styles.blockedText}>
            allow access to camera/library to continue
          </Text>
          <Text style={styles.hint}>
            Open Settings to enable at least one source for new photos.
          </Text>
        </View>
      ) : (
        <>
          {libGranted && !camGranted ? (
            <Text style={styles.degraded}>
              ✦ Library mode — add moments from your rolls.
            </Text>
          ) : null}
          {camGranted && !libGranted ? (
            <Text style={styles.degraded}>
              ✦ Capture mode — shoot only.
            </Text>
          ) : null}

          <View style={styles.digicamShell}>
            <View style={styles.lcdBezel}>
              <View style={styles.lcd}>
                {camGranted ? (
                  <CameraView
                    ref={camRef}
                    style={StyleSheet.absoluteFill}
                    facing={cameraFacing}
                    onCameraReady={() => setCameraReady(true)}
                    onMountError={onCameraMountError}
                  />
                ) : (
                  <View style={styles.noCam}>
                    <Text style={styles.noCamText}>LENS OFFLINE</Text>
                    <Pressable
                      onPress={() => void requestCamPermission()}
                      style={({ pressed }) => [
                        styles.chip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.chipText}>enable camera</Text>
                    </Pressable>
                  </View>
                )}
                <ScanlineOverlay opacity={0.04} />
              </View>
              <View style={styles.lcdLabelRow}>
                <Text style={styles.lcdLabel}>LCD VIEW</Text>
                <Text style={styles.rec}>
                  {camGranted ? "● REC" : "STBY"}
                </Text>
              </View>
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={() => void openLibrary()}
                disabled={!libGranted && libDenied}
                style={({ pressed }) => [
                  styles.sideBtn,
                  (!libGranted && libDenied) && styles.disabledCtl,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="folder-open-outline"
                  size={22}
                  color={colors.babyBlue}
                />
                <Text style={styles.sideLabel}>LIB</Text>
              </Pressable>

              <Pressable
                onPress={() => void capturePhoto()}
                disabled={!camGranted || !cameraReady || capturing}
                style={({ pressed }) => [
                  styles.shutter,
                  (!camGranted || !cameraReady || capturing) &&
                    styles.shutterDisabled,
                  pressed && camGranted && styles.pressed,
                ]}
              >
                {capturing ? (
                  <ActivityIndicator color={colors.bgPanel} />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>

              <Pressable
                onPress={toggleCameraFacing}
                disabled={!camGranted}
                accessibilityLabel={
                  cameraFacing === "back"
                    ? "Switch to front camera"
                    : "Switch to back camera"
                }
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.sideBtn,
                  styles.flipCamBtn,
                  !camGranted && styles.disabledCtl,
                  pressed && camGranted && styles.pressed,
                ]}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={22}
                  color={colors.babyBlue}
                />
              </Pressable>
            </View>
          </View>

          {!libGranted && !libDenied ? (
            <Pressable
              onPress={() => void requestLibPermission()}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryBtnText}>
                Grant library access for imports
              </Text>
            </Pressable>
          ) : null}
        </>
      )}

      <SaveMementoModal
        visible={formOpen}
        previewUri={draftUri}
        onClose={closeForm}
        onSubmit={onSaveMemento}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  brand: {
    fontFamily: fonts.pixel,
    color: colors.hotPink,
    fontSize: 10,
    flex: 1,
  },
  sub: {
    fontFamily: fonts.rounded,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  degraded: {
    fontFamily: fonts.rounded,
    color: colors.softPurple,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  digicamShell: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.lilac,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.bgPanel,
    marginBottom: spacing.md,
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  lcdBezel: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  lcd: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  lcdLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  lcdLabel: {
    fontFamily: fonts.pixel,
    color: colors.textMuted,
    fontSize: 7,
  },
  rec: {
    fontFamily: fonts.pixel,
    color: colors.limeAccent,
    fontSize: 7,
  },
  noCam: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  noCamText: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.textMuted,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.hotPink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.bgPanel,
  },
  chipText: {
    fontFamily: fonts.roundedBold,
    color: colors.hotPink,
    fontSize: 13,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sideBtn: {
    alignItems: "center",
    gap: 4,
    width: 72,
  },
  flipCamBtn: {
    minHeight: 44,
    justifyContent: "center",
  },
  sideLabel: {
    fontFamily: fonts.rounded,
    color: colors.babyBlue,
    fontSize: 11,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.hotPink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.bubblegumPink,
    shadowColor: colors.hotPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  shutterDisabled: {
    opacity: 0.35,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.bgPanel,
    borderWidth: 2,
    borderColor: colors.bubblegumPink,
  },
  centeredBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  blockedText: {
    fontFamily: fonts.roundedBold,
    color: colors.error,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    fontFamily: fonts.rounded,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 13,
  },
  secondaryBtn: {
    marginBottom: spacing.md,
    alignSelf: "center",
    padding: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: fonts.rounded,
    color: colors.hotPink,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  disabledCtl: { opacity: 0.3 },
  pressed: { opacity: 0.78 },
});
