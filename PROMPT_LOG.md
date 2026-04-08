I used Cursor for this project, feeding EXPO Skills to it before beginning. I was on Composer 2 Fast.

---

# Chat 1
## What Can I Even Build?

### ME:
I'm brand new to React Native. Can you explain at a high level how these files create a working app?

### CURSOR:
Here’s a high-level picture of **your** repo: it’s an **Expo** app that uses **Expo Router** (file-based routing) on top of **React Native**.

## 1. Where the app “starts”

In `package.json`, `"main": "expo-router/entry"` tells the native shell (or web bundler) to load Expo Router’s entry script. That script boots React, mounts the root component, and wires up navigation from the files under `app/`.

When you run `npm start` → `expo start`, Metro bundles your JavaScript and the Expo Go app (or a dev build) runs it.

## 2. `app/` = screens and navigation structure

Expo Router treats the `app` folder like a URL tree:

- **`app/_layout.tsx`** — Root layout: wraps the whole app (here: light/dark **theme**, a **stack** navigator, and the status bar). It declares two stack “screens”: the `(tabs)` group and `modal`.
- **`app/(tabs)/_layout.tsx`** — Tab bar layout: **bottom tabs** for `index` (Home) and `explore` (Explore). The `(tabs)` folder name is a **group**; it doesn’t appear in the URL by itself, it just groups those routes.
- **`app/(tabs)/index.tsx`** — The **Home** tab screen (what you’re editing).
- **`app/(tabs)/explore.tsx`** — The **Explore** tab screen.
- **`app/modal.tsx`** — A separate screen presented as a **modal** from the root stack (e.g. from links that go to `/modal`).

So: **layouts (`_layout.tsx`) define navigation chrome**; **files that export a default component are individual screens**.

## 3. How a screen file “becomes” UI

A screen is a normal React function component with a **default export**. Whatever JSX it returns is what React Native draws on screen, using `react-native` building blocks (`View`-like components, `StyleSheet`, etc.) and Expo/React libraries (`expo-image`, `expo-router`’s `Link`, etc.).

Your Home screen composes local pieces (`ParallaxScrollView`, `ThemedText`, …) and uses `StyleSheet.create` for styles — same React mental model as the web, but the renderer is React Native, not the DOM.

## 4. What `components/`, `hooks/`, `constants/` are for

- **`components/`** — Reusable UI (e.g. themed text, parallax header).
- **`hooks/`** — Shared logic (e.g. light/dark mode).
- **`constants/`** — Shared values like theme colors.

Imports like `@/components/...` are path aliases; they don’t change behavior, just keep import paths short.

---

**One-sentence summary:** Expo starts the bundle from `expo-router/entry`, Expo Router maps `app/**` files to routes and nested `_layout.tsx` files to navigators (stack + tabs + modal), and each route file’s default export is a React component that React Native renders as your UI.

If you want to go deeper next, the two most useful files to re-read are `app/_layout.tsx` (overall navigation shell) and `app/(tabs)/_layout.tsx` (how Home vs Explore tabs are defined).

### ME:
What's the difference between React Native and a regular website? How is a View different from a div? If I am mostly familar with html/css how can I understand this?

### CURSOR:
## React Native vs a regular website

| | **Website (typical)** | **React Native (Expo)** |
|---|------------------------|-------------------------|
| **Where it runs** | Browser loads HTML/CSS/JS; the DOM is the UI tree | A **native app** (or web with RN Web) runs JS; UI is **not** the browser DOM on iOS/Android |
| **What draws pixels** | Browser layout engine + CSS | **Native views** (UIKit on iOS, Android views) driven by the RN bridge (or Fabric) |
| **How you “style”** | CSS (cascade, full spec) | Mostly **JavaScript style objects** (subset of CSS ideas + RN-specific props) |
| **URLs & hosting** | Natural: every page is a URL on a server | App is installed; “screens” are **navigation routes**, not necessarily public URLs (unless you add deep links/web) |

Same big idea as React on the web: **UI = functions/components returning a tree**. The difference is **what that tree maps to**: HTML elements vs **native primitives** (`View`, `Text`, etc.).

---

## How `View` is different from `div`

**Role in the UI tree:** Very similar. Both are the generic **container** you use to group and lay out children.

**What they actually are:**

- **`div`** — A real DOM node. The browser knows `div`, CSS applies fully, semantics/accessibility follow HTML rules.
- **`View`** — A **React Native component** that becomes a **native container view** on each platform. There is no DOM `div` in a normal iOS/Android RN app.

**Practical differences you feel day to day:**

- You can’t put raw text inside `View` without wrapping it in **`Text`** (on the web, any element can hold text nodes; in RN, text must be in `Text`).
- Styling is **flexbox-first** (RN’s layout model is essentially flex + a few extras). There is **no full CSS** (no full cascade from stylesheets, many CSS properties don’t exist or work differently).
- **`className`** is a web thing; RN typically uses **`style={...}`** objects (or a styling library that compiles to those).

So: think **“layout box”** for both; think **“DOM + CSS”** for `div` and **“native view + JS styles”** for `View`.

---

## If you know HTML/CSS, how to map your mental model

Use this rough mapping:

- **`div` / section structure** → **`View`**
- **`p`, `span`, headings** → **`Text`** (one `Text` can nest other `Text` for inline styling)
- **`img`** → often **`Image`** from `react-native` or **`expo-image`** (your project uses `expo-image`)
- **`input`, `button`** → **`TextInput`**, **`Pressable`** / **`TouchableOpacity`**, or libraries
- **`<a href>`** → **`Link`** from `expo-router` or navigation APIs
- **CSS `display: flex`** → default layout in RN is already flex-like on containers; **`flexDirection: 'column'`** is like block stacking
- **margins, padding** → same names on the style object
- **`width` / `height` / `%`** → supported in many cases, but **percent and some units** behave differently than the web; when in doubt, check RN docs for that prop
- **hover, complex layouts (grid everywhere), pseudo-elements** → not 1:1 with CSS; you use RN patterns or libraries

**Core habit change:** On the web, **structure (HTML), look (CSS), behavior (JS)** are separate languages. In RN, **structure and look are usually one tree of components + `style` objects**, still in JavaScript/TypeScript.

If you hold onto one sentence: **React is the same component idea; the “browser” is replaced by native UI, and `div`/`span` are replaced by `View`/`Text` with a smaller, JS-driven styling system.**


*note: this map was the MOST helpful for me*

### ME:
How do I add a button and a text input to a React Native screen? Show me a simple example and explain the useState hook.

### CURSOR:
Here’s a minimal pattern you can paste into any screen component (same file where you already `export default function ...`).

## Example: text field + button + `useState`

```tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ExampleScreen() {
  const [value, setValue] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Type something"
        placeholderTextColor="#999"
      />
      <Pressable style={styles.button} onPress={() => console.log('Submitted:', value)}>
        <Text style={styles.buttonLabel}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

**Pieces:**

- **`TextInput`** — the text field. It is **controlled** when you pass both `value` and `onChangeText`: every keystroke calls `onChangeText` with the new string, and you store that in state with `setValue`.
- **`Pressable`** — tap handling + you style it like a button. Alternatives: `Button` (limited styling) or `TouchableOpacity`.

---

## What `useState` does

`useState` is a React hook that **keeps a piece of data in memory for this component** and **triggers a re-render** when that data changes.

```ts
const [value, setValue] = useState('');
```

- **`''`** — initial value (empty string).
- **`value`** — current value on this render (what shows in the input when you use `value={value}`).
- **`setValue(newValue)`** — updates the stored value and tells React to **render again** with the new `value`.

Without state, the input couldn’t “remember” what you typed between renders. Without `onChangeText` updating state, the field wouldn’t stay in sync with typing when it’s controlled.

**Rules of thumb:** Call `useState` at the **top level** of the component (not inside `if`/`for`). One `useState` per simple thing (text, toggle, number); use more hooks if you need several independent values.

---

I'm in **Ask mode**, so this is example-only. If you want this wired into `app/(tabs)/index.tsx` in your project, switch to **Agent mode** and say where you want it on the screen.

### ME:
so for building an app, which files will I be changing and which will stay the same?

### CURSOR:
For an app like yours (Expo + Expo Router), think in **three buckets**.

## You’ll change these a lot

- **`app/(tabs)/index.tsx`**, **`app/(tabs)/explore.tsx`**, and **any new screen files** you add under `app/` (e.g. `app/settings.tsx`, `app/(tabs)/profile.tsx`). These are where your **screens and UX** live.
- **`components/`** — when you **reuse UI** (cards, lists, headers) or split a screen into smaller pieces.
- **`constants/theme.ts`** (or similar) — when you **tune colors, spacing, branding** (if the starter uses it).

That’s the bulk of day-to-day work.

## You’ll touch sometimes, not every feature

- **`app/_layout.tsx`** — **global** shell: themes, stack screens, modal behavior, fonts/providers you add once.
- **`app/(tabs)/_layout.tsx`** — **tab bar**: add/remove tabs, icons, titles, tab options.
- **New routes** — adding a file under `app/` often **is** the change; sometimes you register it in a layout (stack/tab group).

## Usually stays the same unless you’re configuring the project

- **`package.json`** — when you **add/remove dependencies** (libraries).
- **`app.json` / `app.config.*`** (if present) — **app name, icons, splash**, permissions, extra Expo config.
- **`tsconfig.json`**, **`eslint.config.js`** — **tooling**; occasional tweaks.
- **`expo-env.d.ts`** — types for Expo; rarely edited.
- **`scripts/`** — things like `reset-project`; you might never touch them after setup.

**Heuristic:** If it’s under **`app/`** (screens + layouts) or **`components/`**, assume **you own it**. If it’s **project config** at the repo root, assume **stable until** you need a new library or store build setting.

If your course or assignment only cares about **one tab**, you might literally live in **`app/(tabs)/index.tsx`** (and maybe **`components/`**) for a while and leave the rest of the scaffold alone.

### ME: (note here I was at a point where I didn't even know what questions to ask)
Ok. is there anything else I should took into before I clear the tester layout and strat building?

### CURSOR:
Here are the main things worth thinking about **before** you strip the starter UI.

## 1. Don’t lose the reference

Your template advertises `npm run reset-project`: that **moves** the current `app/` to **`app-example/`** so you can still peek at patterns (Expo Router layouts, `Link`, modal, etc.). If you’re deleting by hand instead, **commit to git first** or copy the folder somewhere so you can steal snippets later.

## 2. You probably should **keep** (or recreate) the “glue”

- **`app/_layout.tsx`** — Root stack, theme provider, and how `modal` is registered. If you remove files but leave broken `Stack.Screen` names, the app will error until the layout matches your real routes.
- **`app/(tabs)/_layout.tsx`** — Only needed if you still want bottom tabs; if you’re going single-screen for a while, you might simplify navigation (still fine to start with one tab).

Plan **which routes you need** (e.g. Home only vs Home + Settings) so you don’t delete a layout you still need.

## 3. Themed starter pieces

`ThemedText`, `ThemedView`, `useColorScheme`, and `constants/theme.ts` are optional. If you remove them, either **use plain `Text` / `View`** and your own colors, or you’ll want a simple **light/dark** strategy so things don’t look wrong on device.

## 4. Imports and paths

You’re using the **`@/`** alias (`@/components/...`). That’s defined in tsconfig/babel—**no need to change** unless you move folders around.

## 5. Assets and `require(...)`

Any `require('@/assets/images/...')` in leftover code must match **real files**. After cleanup, search for `require(` and broken image paths.

## 6. How you’ll run it

Keep **Expo Go** or a dev build handy; confirm **one** flow (`npm start`, then scan QR / run simulator) so you’re not debugging tooling and UI at the same time.

## 7. Small scope first

Clearing the screen is enough for a first milestone: **one screen**, **`SafeAreaView` or your layout**, **one navigation pattern**. You don’t have to delete every starter component on day one if you might reuse them.

---

**Short answer:** Use git or `reset-project` so you keep a copy of the template, align **`_layout.tsx` files with whatever routes remain**, and decide whether you’re keeping **tabs + theming** or replacing them with plain RN components before you delete the helpers that depend on them.

### ME:
tell me about the camera features of expo

### CURSOR:
Expo doesn’t give you “one camera API.” It splits camera-related behavior into a few **official packages**, each suited to different UX.

## 1. `expo-image-picker` — system UI (simplest for many homework apps)

Use this when you want **“choose a photo / take a photo”** using the **native picker or camera sheet**, not a live preview in your layout.

- **Pick from library:** e.g. `launchImageLibraryAsync()`
- **Open camera:** e.g. `launchCameraAsync()`
- Returns **assets** (URI, dimensions, mime type, etc.) you can show with `Image` / `expo-image`

Good fit: profile photo, attach image, one-off snapshot without building a custom camera screen.

Docs: [ImagePicker (Expo SDK 54)](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker)

## 2. `expo-camera` — embedded live camera in your screen

Use this when you need a **`<CameraView />` (preview)** inside your app: continuous preview, your own shutter UI, maybe **torch, zoom**, switching **front/back**, etc.

- **Take picture** and **record video** from that component
- **Barcode scanning** is part of this story on supported platforms (check the SDK 54 camera doc for the exact API surface)

Good fit: custom camera UI, scanning, video recording flows.

Docs: [Camera (Expo SDK 54)](https://docs.expo.dev/versions/v54.0.0/sdk/camera)

## Permissions and configuration

Both need **platform permissions** (camera; microphone if you record video). In Expo you usually declare these via **`app.json` / config plugins** so iOS/Android show the right privacy strings. The docs for each package list the **exact keys** (`NSCameraUsageDescription`, Android `CAMERA`, etc.).

## Expo Go vs a dev build

Many camera flows work in **Expo Go**, but **exact behavior** (especially around permissions, video, or newer OS policies) can differ from a standalone build. For a class app, starting with **image picker** or **camera in Expo Go** is common; ship a **development build** if something isn’t supported in Go.

## How to choose

| Goal | Typical choice |
|------|----------------|
| User picks or snaps one image with minimal code | `expo-image-picker` |
| Full-screen / in-layout camera, barcode, custom controls | `expo-camera` |

Installation in Expo projects is usually: `npx expo install expo-image-picker` or `npx expo install expo-camera` so versions match your SDK.

If you say whether your SPEC needs **barcode**, **video**, or just **still photos**, we can narrow to one package and the methods worth reading first.

### ME:
Give me a quick rundown of expo-camera

### CURSOR:
## What “specifications” even means here

People use **“spec”** in two different ways:

1. **Product / assignment spec** — A written doc (like your `SPEC.md`) that says *what the app must do*: screens, flows, data, grading criteria. The “scope” is whatever that document defines.

2. **Technical specification of the stack** — What you’re *actually building with* when you use Expo:

   - **Runtime:** JavaScript/TypeScript executed by Hermes/JS engine inside a native shell.
   - **UI:** React Native components (not HTML).
   - **Native capabilities:** Expo modules (`expo-camera`, `expo-image-picker`, etc.) + optional custom native code (dev builds).
   - **Project config:** `app.json` / `app.config`, permissions, icons, bundle IDs.
   - **Navigation:** e.g. Expo Router (file-based routes) on top of React Navigation.

So the “scope” of an Expo app isn’t mysterious: it’s **normal app requirements** (screens, state, persistence, APIs) implemented with **React Native + Expo’s packaged native APIs**.

## Does it use React?

** yes.** Expo apps are **React Native** apps. You write **React** components (`function Screen() { ... return <View>...</View> }`) with hooks (`useState`, `useEffect`, etc.). React Native renders those to **native views**, not the browser DOM. Expo adds the **tooling** (CLI, libraries, config) so you don’t manage Xcode/Android Studio for every feature.

## How does local storage work?

There isn’t one built-in “Expo localStorage.” You **choose a storage approach** based on what you need:

| Need | Common choice |
|------|----------------|
| Simple key/value strings (settings, tokens, cache) | **`@react-native-async-storage/async-storage`** (often installed via Expo docs / `npx expo install`) |
| Small secrets (tokens) more safely | **`expo-secure-store`** |
| Structured queries / lots of rows | **SQLite** (e.g. `expo-sqlite`) or a wrapper |
| Files (photos, downloads) | **`expo-file-system`** (and sometimes `expo-media-library`) |
| Fast key/value (advanced) | Libraries like **MMKV** (may need a dev build depending on setup) |

**Mental model:** Like the web, nothing saves itself— you **read/write explicitly** when state changes or on load. React state is **in memory** and lost when the process is killed unless you **persist** to one of the stores above.

If you tell me whether your spec needs “remember login,” “offline photos,” or “just a few user prefs,” I can point to the one storage option that fits best.

### ME:
I want it to store photos + notes

### CURSOR:
Here’s a practical way to think about **photos + notes** in Expo, without tying you to one grading rubric.

## Two different “things” to store

1. **Notes (text + metadata)** — small structured data: title/body, created date, maybe an `id`, maybe a **pointer** to a photo file.
2. **Photo files (binary)** — actual image bytes on disk. You almost always **keep the file in app storage** and only store its **path** (or filename) in your notes data.

`AsyncStorage` alone is for **strings** (usually JSON text), not for big images. You use it for the **catalog of notes**, not for storing JPEGs inside the key.

## A solid simple pattern (good for many class apps)

1. **Pick or capture** the image (`expo-image-picker` and/or `expo-camera`) → you get a **temporary** `uri`.
2. **Copy** that file into your app’s persistent folder with **`expo-file-system`** (e.g. under `FileSystem.documentDirectory`). Generate a unique filename (`photo-<uuid>.jpg`).
3. **Save the note** as a JSON object like:
   - `id`, `text`, `createdAt`, `imageUri` (the **copied** path), optional `title`
4. **Persist the list of notes**:
   - **Smallest MVP:** one key in **`@react-native-async-storage/async-storage`** holding `JSON.stringify(notesArray)`.
   - **If the list gets big or you want queries:** **`expo-sqlite`** with a `notes` table and a column for `image_path`.

On launch, **read** JSON/SQLite into React state and **render** images from the stored `file://` path (e.g. `expo-image` or `Image`).

Why copy the file? URIs from the picker/camera are often **not stable long-term**; copying into `documentDirectory` makes them **yours** until the user deletes the app.

## Optional: also save to the camera roll

If you want photos visible in the system Photos app, that’s **`expo-media-library`** (extra permission, different UX). For a private “notes with pictures” journal, **app-private FileSystem storage** is usually enough.

## Mental model

- **Notes = database / JSON** (AsyncStorage or SQLite).  
- **Photos = files on disk** (FileSystem) + **paths recorded in the note**.  
- **React state = what’s on screen right now**; you **load** from persistence on startup and **write** on create/edit/delete.

If you share roughly how many notes you expect (tens vs thousands) and whether photos must survive **reinstall** (usually no) vs just **normal app use** (yes), we can narrow to AsyncStorage+JSON vs SQLite.



*From here I wrote my SPEC*

---

# Chat 2
## Execute

### ME:
Read SPEC.md in this project. Implement the application
exactly as specified. Create all necessary files. Make sure
error handling matches what the spec describes. After creating the
files, run the app to verify it starts without errors. Ensure to read your documentation and your skills for using Expo GO best.

*the app is now built*
---

# Chat 3
## debug

### ME:
Review the code in this project against the spec in SPEC.md.
For each item in the acceptance criteria, check whether the code
actually implements it correctly. Also check for:
- Bugs or logic errors
- Missing error handling
- Code quality issues (unclear naming, repeated code, etc.)
- Security concerns (e.g., unsafe file handling)

Format your review as a numbered list of findings, each marked as
[PASS], [FAIL], or [WARN]. Be specific — reference file names and
line numbers.


*I go through and fix bugs from here*

---

# Chat 4
## New Feature

*I wanted to be able to flip the camera*

### ME:
I would like to add a way to change between front-facing and back camera on the app. (and replace currently where the floppy disk auto button is on the camera screen). Can you do this and add to the spec?

---

# Chat 5
## Fixing Keyboard

### ME:
currently, when you get into a textbox, you are stuck in that textbox wiht no real way out of it. Can you create a feature so that when you tap anywhere outside the keyboard, it closes the keyboard. There is also currently a probem where the keyboard covers the text box. Is there a way to change this UI to make it more intuitive?

*we went back and forth A LOT to fix this bug*

---

# Chat 6
## Date Visibility

### ME:
changing the date in a memento has white text, which is difficult to see on the background. Is there a way to force the date selector to have darker text?

---

# Chat 7
## Questions

### ME:
Can you explain to me how the persistent storage works?

### ME:
so is it fetching from locally on my phone?

### ME:
can you explain what each of these files does again exactly?

### ME:
whats the difference between the ts and tsx files
