# Remember the Time... (Photo Saving App)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

This app is a short memory saving app. Do you ever have that feeling of "I should remember this" in some moments? Take out your phone, snap a quick photo, give it a title, and store it forever. You can always look back at your mementos and remember why you took the photo and what for.

## Features

- Create entries: Take a photo, give it a title and a note and save it to your mementos. Or manually select a photo from your library.
- Camera: Take photos from a cute pink digicam! Take photos of the world, or even selfies of yourself.
- Storage: Entries store and load even after quit and re-launch. Mementos are stored only on your device.
- View memories: Select each photo from the entries view to view the title, note, and date that go along with it
- Edit/delete: edit the note/title/or date or delete an entry, also deleting its image.
- Permission: The app requests camera and photo library permission to access these things.

## Screens & Navigation

| Screen | Purpose |
|--------|---------|
| Camera (index.tsx) | Camera functionality using expo-camera, including a control to switch between front- and back-facing cameras. There is an aesthetic overlay on the camera screen |
| Mementos (mementos.tsx) | A place to see all moments images and notes stored in one place. Clicking on a memory brings up the info in a modal on the app while the screen gallery just displays each moment as an individual photo |

## Running the App

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Download ExpoGo on your phone

4. Scan the QR code with your phone. Your phone **MUST** have ExpoGo downloaded on it already.

5. Start saving memories!

*note: this app has only been tested on iOS. Using on other phone softwares is likely to have varying results*



