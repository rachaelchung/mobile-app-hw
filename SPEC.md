# App Specification

This App is called "Remember the Time..." It is a photography + note journaling app built with JavaScript, React Native, and the expo-camera and expo-image-picker module. 

## Overview

This is a memory collection app. The premise of the app, is sometimes you have small moments you want to remember. You should easily be able to pull up your camera and capture the moment in time with a little title and note to remember it by. You can browse all of your "little moments" afterwards.

## Core Features

- Create entries: you can take a photo, and then promptly attach a title and note to it and store it to your journal. Or you can manually create an entry by selecting a photo from your library.
- Camera facing: on the camera screen you can switch between the back (world-facing) and front (selfie) cameras using the flip control to the right of the shutter.
- Persistence: entries store and load even after quit and re-launch
- View entries: A clean and cute way to view all entries
- View detail: Select each photo from the entries view to view the title and note that go along with it. Along with the date.
- Edit/delete: edit the note/title/or date or delete an entry, also deleting its image.
- Permission: app request camera and photo library permission, with error case handled if user does not grant permission

## Screens & Navigation

| Screen | Purpose | Navigation |
|--------|---------|------------|
| Camera (index.tsx) | Camera functionality using expo-camera, including a control to switch between front- and back-facing cameras. There is an aesthetic overlay on the camera screen | Bottom screen menu, on the left|
| Mementos (mementos.tsx) | A place to see all moments images and notes stored in one place. Clicking on a memory brings up the info in a modal on the app while the screen gallery just displays each moment as an individual photo | Bottom screen menu, on the right |


## Data Model

Each entry stores a unique id, createdAt, date, noteText, and a photo path. They can be stored as JSON in AsyncStorage. 
*Note: the date and createdAt may be the same, but if a user decides to manually edit a date, createdAt will stay the same while date changes. Date is what will be displayed on the mementos however.*

createdAt is the timestamp when the memento was first saved. It never changes.
date is the user-facing "when the moment happened" that defaults to the same calendar day as creation but can be edited later.
The mementos list and detail modal display date, not createdAt

### Entities

**Mementos**
- id: integer (incrementing up with each creation, ignoring deletion)
- createdAt: date stored as ISO date
- date: date stored as ISO date
- noteText: string
- title: string
- photoPath: local file path/URI

## API & Backend

N/A

## Design & Branding

- **Color palette:**
Soft plastic gray as the base/background, hot pink, bubblegum pink, lilac, lavender, soft purple, holographic silver accents. Pops of lime or baby blue as surprises.
- **Typography:**
Rounded bubbly fonts (like Fredoka, Nunito) for friendly UI, mixed with handwritten scrawl fonts for sticker-style labels. Maybe a chunky pixel font for timestamps and metadata.
- **Style direction:**
Y2K Digital Archive
Gray plastic UI "shell" decorated with PNG-style stickers — stars, hearts, flowers, sparkles — layered on top. Photos have that digicam quality: slightly grainy, warm flash, dated timestamp in the corner. UI elements feel like sticker sheets — rounded, puffy, peel-able.

## Platform Targets

- [X] iOS (prioritized)
- [ ] Android
- [ ] Web

## Notifications & Background Tasks

N/A

## Offline Behavior

You should still be able to do all functionalities offline.

## Analytics & Monitoring

N/A

## Constraints & Non-Goals

No accounts, no backend, no editing images in-app, however photos are automatically out into a filter.
You are not meant to replace images in an existing memento.

## Acceptance Criteria

- Taking a photo creates a memento, and prompts to fill in all info. Only title required, note itself is optional.
- Info can be edited after created
- There is a way to manually create mementos with existing photos
- Mementos can be deleted and the only features that can be edited are date (NOT createdAt), title, and noteText.
- No memories shows a screen that says "no memories captured yet. Get out there!"
- If camera not allowed access, continue to allow degraded mode with library only.
- If library not allowed access continue to allow degraded mode with camera only.
- If both not allowed, display error message "allow access to camera/library to continue"
- gallery mementos are sorted by date (NOT createdAt), with the newest memories appearing at the top
- user can always open mementos and see past entries; new mementos require at least one permission
- camera screen includes a flip control to switch between front- and back-facing cameras (when camera permission is granted)

