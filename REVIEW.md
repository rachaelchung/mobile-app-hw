
Here’s a concise audit against `SPEC.md` (acceptance criteria plus cross-cutting checks), with file/line references.

---

### Acceptance criteria (84–93)

1. **[PASS]** **Take photo → memento flow; title required, note optional** — Shutter calls `takePictureAsync`, sets `draftUri`, opens `SaveMementoModal` (`app/(tabs)/index.tsx` 54–66, 203–208). Save requires `title.trim().length > 0`; note is optional (`components/SaveMementoModal.tsx` 41, 76–91). Persist happens in `createMemento` (`lib/mementos/storage.ts` 76–98). *Note:* The row is only written on **Save**, not on capture alone—which matches “prompts to fill in” rather than creating before the user confirms.

2. **[PASS]** **Edit after create** — Detail modal edits title, note, and display date and calls `updateMemento` (`components/MementoDetailModal.tsx` 65–78, 178–179; `context/MementosContext.tsx` 61–68).

3. **[PASS]** **Manual entry from library** — `openLibrary` uses `launchImageLibraryAsync` and opens the same save sheet (`app/(tabs)/index.tsx` 39–51).

4. **[PASS]** **Delete removes entry + image; only `date`, `title`, `noteText` editable (not `createdAt`)** — `updateMemento` only merges `title`, `noteText`, `date` (`lib/mementos/storage.ts` 101–119). `removeMemento` deletes the file then drops the row (`122–131`). `createdAt` is never part of the patch.

5. **[PASS]** **Empty gallery copy** — Matches the spec string (`app/(tabs)/mementos.tsx` 62–64).

6. **[PASS]** **Camera denied → library-only degraded** — `bothBlocked` is only when **both** are denied (`app/(tabs)/index.tsx` 35–37, 87–97). If camera is off but library works, user sees “Library mode” and can still open the picker (`99–103`, `145–160`).

7. **[PASS]** **Library denied → camera-only degraded** — Shutter works when `camGranted`; LIB is disabled when `!libGranted && libDenied` (`162–177`, `145–152`); “Capture mode” copy (`104–108`).

8. **[PASS]** **Both denied → fixed error string** — Message matches the spec (`app/(tabs)/index.tsx` 90–91).

9. **[PASS]** **Gallery sorted by `date`, newest first** — `fetchMementos` sorts by `date` descending (`lib/mementos/storage.ts` 69–73). List uses that order (`app/(tabs)/mementos.tsx` 67–68). UI copy matches (`47`).

10. **[PASS]** **Always view past mementos; creating new needs ≥ one permission** — Mementos screen only loads storage (`app/(tabs)/mementos.tsx` 28–29, 67–68); no camera/library gate. New capture/pick paths require the corresponding permission flows on the camera tab (`app/(tabs)/index.tsx` 39–43, 54–56, 87–97).

---

### Additional findings (bugs, errors, quality, security)

11. **[WARN]** **Save/update failures are easy for users to miss** — `addMemento` does not catch or surface storage errors (`context/MementosContext.tsx` 53–58). `SaveMementoModal` does not catch failures from `onSubmit` (no user-visible error; modal may stay open without explanation) (`components/SaveMementoModal.tsx` 43–51). Same pattern for edits in `MementoDetailModal.handleSave` (`65–78`).

12. **[WARN]** **Retry path does not show a loading state** — `reload` never sets `loading` back to `true`, so a retry after an error may show old data until the fetch finishes (`context/MementosContext.tsx` 37–46).

13. **[WARN]** **Spec constraint: automatic photo filter** — Under “Constraints & Non-Goals,” the spec says photos are put through a filter (`SPEC.md` 79). There is no image processing/filter on saved assets (only UI overlays like `ScanlineOverlay` on screens). Functionally this is **not implemented** vs that line in the spec.

14. **[WARN]** **“Both blocked” detection is tied to `status === "denied"`** — If a platform ever reports a non-granted state that is not exactly `"denied"` for both media and camera, the full-block message might not appear while the user still cannot capture or pick. Uncommon but worth knowing (`app/(tabs)/index.tsx` 35–37).

15. **[PASS]** **IDs monotonic across deletes** — `nextId` increments and is not reused when entries are removed (`lib/mementos/storage.ts` 81–96, 122–131), matching the data model (`SPEC.md` 38).

16. **[PASS]** **Offline / local persistence** — AsyncStorage + copying into the app document directory is appropriate for offline use (`lib/mementos/storage.ts` 1–7, 48–55, 28–29).

17. **[PASS]** **File delete safety** — Deletes use paths originating from app-managed copies; `deletePhotoFile` checks existence and uses `idempotent` delete (`lib/mementos/storage.ts` 58–67). No user-supplied paths in the update API. Reasonable for this app.

18. **[WARN]** **Best-effort delete can leave orphans** — If `deleteAsync` fails after removing the JSON entry, the image could remain on disk (`122–131` + `deletePhotoFile` swallowing errors). Low likelihood, minor housekeeping issue.

---

**Summary:** All **listed acceptance criteria** are implemented in line with the spec. The main gaps are **no user-visible handling** for failed saves/loads, **no automatic photo filter** as described in constraints, and a few **edge-case / polish** items around loading state and permission status modeling.