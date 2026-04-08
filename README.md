# Remember the Time... (Photo Saving App)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

This app is a short memory saving app. Do you ever have that feeling of "I should remember this" in some moments? Take out your phone, snap a quick photo, give it a title, and store it forever. You can always look back at your mementos and remember why you took the photo and what for.

I chose this idea because I found myself often wanting to "remember the moment" but not being able to save it in a meaningful way. Either it would take too long and I would miss the actual moment, or I wouldn't remember what I took the photo for in the first place. This app lets you quickly snap a picture and give it a short title before saving it to your gallery.

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


## What I Learned

The most surprising part of this project for me was how much I could do with so little knowledge. The amount of files necessary when I launched the first app template in Expo seemed quite daunting. Even after asking AI to explain, I still felt quite nervous but moved forward anyway. I pushed myself to try to use something that only a phone could do, so I wanted to use the camera, but with my now limited knowledge of React, this felt like a lofty goal. Yet, with the help of AI I was able to do this quite easily. I often didn't even know what questions to ask, but was still able to succeed. Phone apps seem so much less daunting now.