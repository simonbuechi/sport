# Sport-Amigo Codebase Review & Audit Report

**Date:** 2026-11-25  
**Scope:** Full-stack web application (`src/`, `functions/`, `firestore.rules`, build & lint configuration)  
**Pillars Reviewed:** Security • Data Integrity & Correctness • Code Quality • Code Efficiency • Code Redundancy

---

## Executive Summary

A full audit of the Sport-Amigo repository uncovered **34 actionable findings** across the five requested pillars:

| Category | Critical | High | Medium | Low | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Security** | 1 | 0 | 2 | 2 | **5** |
| **2. Data Integrity & Correctness** | 0 | 4 | 5 | 2 | **11** |
| **3. Code Quality & Maintainability** | 0 | 0 | 4 | 2 | **6** |
| **4. Code Efficiency & Performance** | 0 | 2 | 3 | 1 | **6** |
| **5. Code Redundancy & Dead Code** | 0 | 0 | 3 | 3 | **6** |
| **Total** | **1** | **6** | **17** | **10** | **34** |

### Top Priorities to Address First
1. **[SEC-01] Critical Firestore Rules Bypass (`firestore.rules`):** Multiple `allow` statements in the same `match` block are combined with logical **`OR`** by Firestore. Standalone `allow create, update` schema checks lack authentication/ownership conditions, allowing **unauthenticated users** to create or overwrite any user's profile, workouts, templates, programs, and global `/exercises` or `/program_library` documents.
2. **[INT-01] Global `limit(10)` Workout Subscription Truncates App Features (`WorkoutsContext.tsx`):** `WorkoutsContext` only subscribes to the 10 latest workouts, yet 6 features (Workout Details, Edit Workout, Personal Record badges, Exercise Progress Charts, Exercise History, Auto-fill, and Calendar Widget) treat `entries` as the user's complete workout history—causing `"Workout not found"` errors on older workouts and false-positive PR badges.
3. **[INT-02] Cloud Functions Target Wrong Firestore Database (`functions/src/index.ts`):** The web app connects to the named `'default'` Firestore database, while Cloud Functions target `(default)`, so backend triggers (`onActivityCreated`) never fire.
4. **[INT-03] Unauthenticated Subscription Startup & Missing Snapshot Error Handlers (`ExercisesContext.tsx`, `db.ts`):** `ExercisesProvider` subscribes to `/exercises` before login, triggering a `permission-denied` error that permanently kills the listener until a full page reload, and 5 of 7 `onSnapshot` calls lack error callbacks.

---

## 1. Security

### [SEC-01] Critical: Unauthenticated Arbitrary Create & Overwrite in Firestore Rules
- **Severity:** **Critical (P0)**
- **Location:** [firestore.rules](file:///d:/dev/antigravity/sport/firestore.rules#L15-L65)
- **Problem:** In Firestore Security Rules, multiple `allow` rules inside the same `match` block are evaluated with **logical `OR`**, not `AND`. Every collection in `firestore.rules` pairs an ownership/admin rule with a separate `allow create, update` validation rule that contains **no authentication or ownership check**:
  - `/exercises/{exerciseId}` (lines 20–21): Anyone on the internet (unauthenticated) can create or overwrite any global exercise if `name` and `type` are strings.
  - `/program_library/{programId}` (lines 29–31): Anyone unauthenticated can create or overwrite any starter program if `name`, `type`, and `days` are present.
  - `/users/{userId}` (line 39) and subcollections `activities` (lines 45–46), `templates` (lines 53–54), `programs` (lines 61–63): Anyone unauthenticated can overwrite any user's profile or inject/overwrite workouts, templates, and programs under any `userId`.
  - Conversely, `allow write: if isOwner(userId)` (`write` = `create, update, delete`) allows owners/admins to **bypass** the schema validation rules completely.
- **Recommended Fix:** Separate `read, delete` from `create, update`, and combine authorization + schema validation with `&&`:
  ```protobuf
  function isAdmin() {
    return isAuthenticated() && request.auth.uid == 'Ib3y7vFU94QZbgbXB7flrrHGbtk1';
  }

  match /exercises/{exerciseId} {
    allow read: if isAuthenticated();
    allow delete: if isAdmin();
    allow create, update: if isAdmin()
                          && request.resource.data.name is string
                          && request.resource.data.type is string;
  }

  match /program_library/{programId} {
    allow read: if isAuthenticated();
    allow delete: if isAdmin();
    allow create, update: if isAdmin()
                          && request.resource.data.name is string
                          && request.resource.data.type is string
                          && request.resource.data.days is list;
  }

  match /users/{userId} {
    allow read, delete: if isOwner(userId);
    allow create, update: if isOwner(userId)
                          && (!('name' in request.resource.data) || request.resource.data.name is string);

    match /activities/{activityId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
                            && request.resource.data.date is string
                            && request.resource.data.exercises is list;
    }

    match /templates/{templateId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
                            && request.resource.data.name is string
                            && request.resource.data.exercises is list;
    }

    match /programs/{programId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
                            && request.resource.data.name is string
                            && request.resource.data.type is string
                            && request.resource.data.days is list;
    }
  }
  ```
  *(Note: On `/users/{userId}`, making `name` optional on partial `updateDoc` calls such as `addWeightEntry` or `updateExerciseStatusInProfile` ensures compatibility with both the web app and the shared Android app.)*

### [SEC-02] Missing Admin Route Guards & Hardcoded Admin UID
- **Severity:** **Medium**
- **Location:** [App.tsx](file:///d:/dev/antigravity/sport/src/App.tsx#L52-L53), [Exercises.tsx](file:///d:/dev/antigravity/sport/src/pages/Exercises.tsx#L235-L266), [ExerciseForm.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseForm.tsx#L1-L260), [firestore.rules](file:///d:/dev/antigravity/sport/firestore.rules#L17)
- **Problem:**
  1. `/exercises/new` and `/exercises/:id/edit` are protected only by `<PrivateRoute>` rather than an `<AdminRoute>`, and `Exercises.tsx` exposes `"Create New Exercise"` UI buttons to non-admin users—who can fill out the entire form before failing on Firestore save (once `SEC-01` is fixed).
  2. The admin UID `'Ib3y7vFU94QZbgbXB7flrrHGbtk1'` is hardcoded in `firestore.rules` (and nowhere checked in the client UI) instead of using Firebase Auth Custom Claims (`request.auth.token.admin == true`) or a centralized admin helper.
- **Recommended Fix:** Add Firebase custom claims (or an `ADMIN_UIDS` constant mirrored in UI + rules), hide exercise creation/editing controls from non-admin users, and guard `/exercises/new` and `/exercises/:id/edit` with an `<AdminRoute>`.

### [SEC-03] Inconsistent URL Validation vs. Sanitization Logic
- **Severity:** **Medium**
- **Location:** [security.ts](file:///d:/dev/antigravity/sport/src/utils/security.ts#L5-L51), [ExerciseForm.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseForm.tsx#L91-L108)
- **Problem:** `isValidSafeUrl` and `sanitizeUrl` parse non-HTTP strings differently:
  - For an input like `"example.com:8080/video"`, `isValidSafeUrl` prepends `https://` (`new URL('https://example.com:8080/video')`) and returns `true`, allowing form submission.
  - Immediately afterward, `sanitizeUrl("example.com:8080/video")` sees `:` before `/` without `http://` or `https://`, treats `example.com:` as an unknown scheme, and silently replaces the user's URL with `'#'` in Firestore.
- **Recommended Fix:** Normalize protocol-less external URLs consistently in a single helper (e.g., prepend `https://` if no scheme is present before validating with `new URL()`, and reject any scheme other than `http:` / `https:`).

### [SEC-04] Incomplete Account Deletion (Soft-Delete Retains PII & Fails for Email/Password Users)
- **Severity:** **Low (Privacy / Compliance & Auth Bug)**
- **Location:** [DeleteAccount.tsx](file:///d:/dev/antigravity/sport/src/pages/DeleteAccount.tsx#L78-L98), [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L63-L68)
- **Problem:**
  1. `DeleteAccount.tsx` calls `softDeleteUserProfile(uid)` (setting `{ deleted: true, deletedAt }`) and deletes the Firebase Auth record, leaving all personal health data (`weights`, `measurements`, `name`, `activities`, `templates`, `programs`) orphaned in Firestore permanently without a TTL or Cloud Function cleanup (`auth.user().onDelete`). This conflicts with GDPR "Right to Erasure" and Google Play / App Store account deletion requirements.
  2. Line 81 hardcodes `reauthenticateWithPopup(currentUser, googleProvider)` on `auth/requires-recent-login`, which fails for users who registered with **Email & Password** via `Auth.tsx`.
- **Recommended Fix:** Add a Cloud Function triggered on Auth user deletion (or use the official Firebase *Delete User Data* extension) to purge `/users/{uid}` and its subcollections, and inspect `currentUser.providerData` to re-authenticate with `EmailAuthProvider.credential` when appropriate.

### [SEC-05] Unscoped Legacy `localStorage` Workout Draft Fallback
- **Severity:** **Low**
- **Location:** [useWorkoutForm.ts](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L101), [WorkoutForm.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutForm.tsx#L425)
- **Problem:** When creating a workout, `useWorkoutForm` falls back to `localStorage.getItem('workout_draft_new')` (unscoped by `uid`). On a shared browser/device, logging out of Account A and into Account B can expose a legacy workout draft across accounts.
- **Recommended Fix:** Remove the legacy `'workout_draft_new'` fallback and rely solely on the UID-scoped key `workout_draft_${currentUser.uid}_new`.

---

## 2. Data Integrity & Correctness

### [INT-01] `WorkoutsContext` `limit(10)` Pagination Corrupts History, Editing, PRs, Charts, and Calendar
- **Severity:** **High**
- **Location:** [WorkoutsContext.tsx](file:///d:/dev/antigravity/sport/src/context/WorkoutsContext.tsx#L44), [WorkoutDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutDetails.tsx#L49-L105), [useWorkoutForm.ts](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L80-L85), [ExerciseDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseDetails.tsx#L45), [ExerciseHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseHistory.tsx#L39), [CalendarWidget.tsx](file:///d:/dev/antigravity/sport/src/components/dashboard/widgets/CalendarWidget.tsx#L15), [useHomeState.ts](file:///d:/dev/antigravity/sport/src/hooks/useHomeState.ts#L85-L94)
- **Problem:** `WorkoutsContext` initializes `currentLimit = 10`, subscribing only to the 10 most recent workouts (`subscribeToWorkouts(uid, cb, 10)`). However, the rest of the application assumes `entries` contains the user's **entire** workout history:
  1. **Direct Navigation / Old Workout Lookup Fails:** Navigating to `/journal/:id` or `/journal/:id/edit` for any workout older than the 10th most recent (e.g., from `TemplateAccordion`'s workout list or a bookmark) displays `"Workout not found"`.
  2. **False-Positive Personal Records (PRs):** `WorkoutDetails.tsx` (lines 89–103) computes all-time 1RM PR badges by comparing only against `allWorkouts` in memory (the last 10 workouts). Any lift heavier than the past 10 sessions is falsely awarded an all-time PR badge.
  3. **Truncated Progress Charts & Exercise History:** `ExerciseProgressChart` ("1 Year" / "All Time") and `ExerciseHistory` only display sets from the last 10 workouts unless the user manually clicked "Load More" repeatedly in `Journal.tsx` beforehand.
  4. **Incomplete Auto-Fill & Calendar:** `previousExercisesMap` in `useWorkoutForm.ts` (lines 244–258) fails to auto-fill weights if an exercise wasn't performed in the last 10 sessions, and `CalendarWidget` blanks out earlier months (or even the current month if >10 workouts were logged).
- **Recommended Fix:**
  - Add a `getWorkoutById(userId, workoutId)` fallback in `WorkoutDetails` and `useWorkoutForm` when the ID isn't in the current `entries` slice.
  - Subscribe to a higher baseline limit (e.g., `200`–`500` workouts, which are small JSON docs) or provide a dedicated query/hook for analytics/history views (`ExerciseDetails`, `ExerciseHistory`, `CalendarWidget`).

### [INT-02] Cloud Functions Target `(default)` Instead of Named `'default'` Firestore Database
- **Severity:** **High**
- **Location:** [functions/src/index.ts](file:///d:/dev/antigravity/sport/functions/src/index.ts#L9-L28) vs. [src/firebase/config.ts](file:///d:/dev/antigravity/sport/src/firebase/config.ts#L35)
- **Problem:** `src/firebase/config.ts` connects to the named Firestore database `'default'` (`initializeFirestore(app, ..., 'default')`). In `functions/src/index.ts`, `getFirestore()` is called with no database ID and `onDocumentCreated("users/{userId}/activities/{activityId}")` omits `database: "default"`, binding to `(default)` instead. As a result, `onActivityCreated` will never trigger on production writes.
- **Recommended Fix:** Pass `'default'` to `getFirestore(app, 'default')` and specify `{ document: "users/{userId}/activities/{activityId}", database: "default" }` in `onDocumentCreated`.

### [INT-03] `ExercisesContext` Subscribes Before Auth, Permanently Killing Listener on Login Page
- **Severity:** **High**
- **Location:** [App.tsx](file:///d:/dev/antigravity/sport/src/App.tsx#L80-L85), [ExercisesContext.tsx](file:///d:/dev/antigravity/sport/src/context/ExercisesContext.tsx#L25-L32), [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L11-L24)
- **Problem:** `ExercisesProvider` wraps the entire app outside `<PrivateRoute>` and immediately calls `subscribeToExercises()` on mount with `[]` dependencies—even when `currentUser` is `null` (e.g., on `/login`). Because `/exercises` requires `isAuthenticated()` in `firestore.rules`, Firestore rejects the listener with `permission-denied` and **terminates** the `onSnapshot` stream. When the user subsequently logs in without reloading the page, `ExercisesContext` never re-subscribes, leaving `exercises = []` and `loading = true` indefinitely.
- **Recommended Fix:** Depend on `currentUser` from `useAuth()` inside `ExercisesProvider` (only subscribe when `currentUser` is non-null, just like `WorkoutsContext` and `UserProfileContext`), and pass an `onError` handler to `onSnapshot`.

### [INT-04] Unhandled `onSnapshot` Errors Cause Infinite Loading States
- **Severity:** **High**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L20-L175) (`subscribeToExercises`, `subscribeToUserProfile`, `subscribeToWorkouts`, `subscribeToWorkoutsByTemplate`, `subscribeToTemplates`)
- **Problem:** 5 out of 7 Firestore `onSnapshot` subscriptions in `db.ts` omit the second `onError` callback. If a network drop, missing index, or permission error occurs, `loading` remains `true` forever across `ExercisesContext`, `UserProfileContext`, `WorkoutsContext`, and `TemplateAccordion`, freezing pages on `<PageLoader />` with no error feedback.
- **Recommended Fix:** Add `onError?: (error: Error) => void` callbacks to every `subscribeTo*` function in `db.ts`, log the error, set `loading = false`, and surface an error state in the respective contexts.

### [INT-05] `"undefinedkg"` Rendered in `TemplateAccordion` When Set Weight Is Omitted
- **Severity:** **Medium**
- **Location:** [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L166-L169), [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L341-L343), [starterPrograms.ts](file:///d:/dev/antigravity/sport/src/data/starterPrograms.ts#L50-L70)
- **Problem:** Both `TemplatesSection`'s sample generator (`{ id, reps: 10 }`) and all 8 programs in `starterPrograms.ts` create template sets with `reps` only (`weight` is `undefined` until the user logs their working weight). `TemplateAccordion.tsx` line 168 formats chips as:
  ```ts
  const label = `${String(set.weight)}kg x ${String(set.reps)}...`;
  ```
  When `set.weight` is `undefined`, every set chip in cloned library templates renders literally as **`"undefinedkg x 5"`**.
  Additionally, `cloneProgramFromLibrary` (`db.ts` line 341) copies static set IDs (`'s1'`, `'s2'`) directly from `starterPrograms.ts` without generating fresh UUIDs per cloned template.
- **Recommended Fix:** Format set chips conditionally (`set.weight != null ? `${set.weight}kg x ${set.reps ?? 0}` : `${set.reps ?? 0} reps``) and regenerate `id: crypto.randomUUID()` for every cloned set in `cloneProgramFromLibrary`.

### [INT-06] Race Condition When Unlinking Multi-Exercise Supersets
- **Severity:** **Medium**
- **Location:** [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L422-L426), [TemplatesSection.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplatesSection.tsx#L146-L156), [WorkoutForm.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutForm.tsx#L299-L303)
- **Problem:** Clicking the group-level "Unlink Superset" button runs:
  ```ts
  block.items.forEach(item => {
      onUnlinkSuperset?.(template.id, item.originalIndex);
  });
  ```
  In `TemplatesSection.tsx`, `handleUnlinkSuperset` is `async` and reads `templatesRef.current` synchronously on each iteration before any `await updateTemplate(...)` completes. For a 3-exercise Giant Set, this fires 3 concurrent `updateDoc` calls where each call starts from the **stale** initial array and only unlinks one index—so the last write wins and leaves the other exercises linked.
- **Recommended Fix:** Add a dedicated `unlinkEntireSuperset(items, supersetId)` utility in `supersetUtils.ts` that clears `supersetId` and `supersetNote` for all matching exercises in a single state/Firestore update.

### [INT-07] `updateDoc` Crashes When User Profile Document Does Not Exist Yet
- **Severity:** **Medium**
- **Location:** [UserProfileContext.tsx](file:///d:/dev/antigravity/sport/src/context/UserProfileContext.tsx#L56-L68), [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L59-L80) & [L194-L199](file:///d:/dev/antigravity/sport/src/services/db.ts#L194-L199)
- **Problem:** If `/users/{uid}` has not been created in Firestore (e.g., an account created via Android or a network interruption during signup), `UserProfileContext` synthesizes an in-memory default profile (`snapshot === null`). Subsequent calls to `updateUserProfile`, `addWeightEntry`, `addMeasurementEntry`, `softDeleteUserProfile`, or `updateExerciseStatusInProfile` use `updateDoc(...)`, which throws `FirebaseError: No document to update`. (Note: dot-notation in `updateExerciseStatusInProfile` also requires `setDoc` with nested object structure if using `{ merge: true }`.)
- **Recommended Fix:** Use `setDoc(doc(db, 'users', uid), data, { merge: true })` (with nested `{ markedExercises: { [exerciseId]: status } }` instead of dot-keys) so updates succeed whether or not the profile document already exists.

### [INT-08] Non-Atomic Multi-Document Writes in `cloneProgramFromLibrary`
- **Severity:** **Medium**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L318-L376)
- **Problem:** Cloning a starter program creates up to 6–8 template documents via sequential `await createTemplate(...)` calls followed by `await createProgram(...)`. If the network drops mid-loop, the user is left with orphaned templates and no program.
- **Recommended Fix:** Pre-allocate document references with `doc(collection(db, 'users', userId, 'templates'))` and commit all templates + the program atomically in a single `writeBatch(db)`.

### [INT-09] UTC vs. Local Timezone Shift on `YYYY-MM-DD` Dates
- **Severity:** **Medium**
- **Location:** [WorkoutItem.tsx](file:///d:/dev/antigravity/sport/src/components/journal/WorkoutItem.tsx#L106), [WorkoutDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutDetails.tsx#L118), [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L616), [ExerciseHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseHistory.tsx#L96), [BodyHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/BodyHistory.tsx#L139), [useHomeState.ts](file:///d:/dev/antigravity/sport/src/hooks/useHomeState.ts#L88)
- **Problem:** In ECMAScript, `new Date("2026-11-25")` (ISO date without time) is parsed as **UTC midnight (`00:00:00Z`)**, whereas `toLocaleDateString()` formats in the user's **local** timezone. For any user in UTC− timezones (Americas, etc.), `"2026-11-25"` renders as **Tuesday, Nov 24** instead of Wednesday, Nov 25! Similarly, `useHomeState.ts` compares UTC-parsed `new Date(e.date)` against local `sevenDaysAgo`.
- **Recommended Fix:** Add a `parseLocalDate(dateStr: string)` helper in `src/utils/format.ts` (e.g., splitting `YYYY-MM-DD` into `new Date(year, month - 1, day)` or appending `'T00:00:00'`) and use it consistently everywhere workout/body dates are parsed.

### [INT-10] Falsy Checks Drop Valid `0` Numeric Values
- **Severity:** **Low**
- **Location:** [WorkoutDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutDetails.tsx#L302-L308), [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L633), [BodyHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/BodyHistory.tsx#L87-L91), [useWorkoutForm.ts](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L413-L415)
- **Problem:** Expressions such as `Number(length) || (elapsedMinutes > 0 ? elapsedMinutes : undefined)`, `workout.length && ...`, and `weight.bodyFatPercent ? ...` treat `0` as falsy/empty, overriding an explicit `0` duration with `elapsedMinutes` or hiding `0` values in tables.
- **Recommended Fix:** Check `value !== '' && value !== undefined && value !== null` (or `typeof value === 'number'`) instead of truthiness on numeric fields.

### [INT-11] Unbounded Array Growth on `/users/{uid}` (`weights` & `measurements`)
- **Severity:** **Low (Long-Term Scalability)**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L70-L80), [BodyHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/BodyHistory.tsx#L49-L74)
- **Problem:** Storing all historical `weights` and `measurements` inside arrays on the root `/users/{uid}` document means every body-metric log re-transmits the entire profile document to all active listeners, and deleting/editing an entry rewrites the entire array (`updateProfile({ weights: updatedWeights })`), risking lost updates on concurrent edits (e.g., web + Android app).
- **Recommended Fix:** Keep backward compatibility with the Android app for now, but plan a migration or archival cap if entries grow into the thousands (Firestore 1 MiB doc limit).

---

## 3. Code Quality & Maintainability

### [QUAL-01] Extensive Hardcoded English Strings & Incorrect Tooltip Keys (i18n Drift)
- **Severity:** **Medium**
- **Location:**
  - [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L191-L586): 20+ hardcoded English strings (`"Move Up"`, `"Move Down"`, `"Set"`, `"Add notes"`, `"Remove Exercise"`, `"Unknown Exercise"`, `" (Archived)"`, `"Use"`, `"Edit Template"`, `"No exercises. Start by adding one below."`, `"Search Exercise"`, `"Add Exercise"`, `"Workouts with this Template"`, `"Start Workout"`, `"Loading workout history..."`, `"No workouts have been logged..."`, `"Log First Workout"`).
  - [ExerciseProgressChart.tsx](file:///d:/dev/antigravity/sport/src/components/exercises/ExerciseProgressChart.tsx#L66-L109): `"Weight Progress"`, `"Timeframe"`, `"Last Month"`, `"Last 3 Months"`, `"Max 1RM (kg)"`, `"Not enough data points yet..."`.
  - [Profile.tsx](file:///d:/dev/antigravity/sport/src/pages/Profile.tsx#L310-L318): `"Member Since"`, `"Last Login"`, `'Unknown'`.
  - [ProgramDialog.tsx](file:///d:/dev/antigravity/sport/src/components/routines/ProgramDialog.tsx#L234-L307): `"Schedule mode:"`, English placeholders on lines 234, 307, 530, 701.
  - [Home.tsx](file:///d:/dev/antigravity/sport/src/pages/Home.tsx#L224-L236): Both the Move Widget Up and Move Widget Down buttons use `Tooltip title={t('common.back')}` ("Back") instead of Move Up / Move Down labels!
- **Recommended Fix:** Extract all remaining hardcoded UI strings into `en.ts`, `de.ts`, `fr.ts`, `it.ts`, and `es.ts`, and fix the widget reorder tooltips in `Home.tsx`.

### [QUAL-02] Dark Mode Styling Bug in `ProgramDialog` Footer
- **Severity:** **Low**
- **Location:** [ProgramDialog.tsx](file:///d:/dev/antigravity/sport/src/components/routines/ProgramDialog.tsx#L723)
- **Problem:** `<DialogActions sx={{ ..., bgcolor: 'grey.50' }}>` hardcodes a bright off-white `#fafafa` background regardless of theme mode, creating a glaring white bar at the bottom of the dialog in Dark Mode.
- **Recommended Fix:** Use `bgcolor: 'background.default'` or `bgcolor: 'action.hover'`.

### [QUAL-03] Inconsistent Error Handling, Swallowed Mutations, and Dead `error` States
- **Severity:** **Medium**
- **Location:** [BodyHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/BodyHistory.tsx#L73), [TemplatesSection.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplatesSection.tsx#L96-L295), [ExerciseDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseDetails.tsx#L36-L60), [ExerciseHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseHistory.tsx#L30)
- **Problem:**
  - `BodyHistory.tsx` uses a blocking browser `alert("Failed to delete entry.")`.
  - `TemplatesSection.tsx` has 10 `try/catch` blocks that only `console.error(...)` with zero user feedback when saving/deleting/updating fails.
  - `ExerciseDetails.tsx` (line 36) and `ExerciseHistory.tsx` (line 30) declare `const [error] = useState('')` without `setError` and render dead `{error && <Alert>}` blocks (`setError` is commented out on `ExerciseDetails.tsx` line 59).
- **Recommended Fix:** Standardize user-facing mutation error feedback via a shared MUI `<Snackbar>` / toast context or active `<Alert>` state, and remove or wire up dead `error` states.

### [QUAL-04] Weak ID Generation via `Math.random().toString(36)`
- **Severity:** **Low**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L342-L361), [supersetUtils.ts](file:///d:/dev/antigravity/sport/src/utils/supersetUtils.ts#L33)
- **Problem:** `Math.random().toString(36).substring(2, 9)` has low entropy and collision resistance compared to `crypto.randomUUID()`, which is already used in `TemplatesSection.tsx`, `ProgramDialog.tsx`, and `useWorkoutForm.ts`.
- **Recommended Fix:** Replace `Math.random()` ID generation with `crypto.randomUUID()`.

### [QUAL-05] Unsafe Firestore Casts Without Defensive Array Defaults
- **Severity:** **Medium**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L21-L307)
- **Problem:** While `mapWorkout` safely defaults `exercises: data.exercises ?? []`, `subscribeToTemplates`, `subscribeToPrograms`, and `subscribeToProgramLibrary` directly cast `{ id: doc.id, ...doc.data() } as TrainingTemplate / Program`. If a document written by the Android client or a partial write lacks `exercises: []` or `days: []`, components calling `template.exercises.length` or `program.days.length` will throw a runtime `TypeError` and crash the React tree.
- **Recommended Fix:** Add lightweight mapper functions (`mapTemplate`, `mapProgram`, `mapProgramLibraryItem`) in `db.ts` that guarantee `exercises: data.exercises ?? []` and `days: data.days ?? []`.

### [QUAL-06] Cloud Functions Directory Excluded from Root ESLint
- **Severity:** **Medium**
- **Location:** [eslint.config.js](file:///d:/dev/antigravity/sport/eslint.config.js#L11)
- **Problem:** `globalIgnores(['dist', 'functions'])` excludes `functions/src/index.ts` from `npm run lint`, allowing backend lint/type issues to go unnoticed during CI or local checks unless `cd functions && npm run lint` is run separately.
- **Recommended Fix:** Include `functions/src/**/*.ts` in root lint scripts (or chain `npm --prefix functions run lint` into the root `lint` script in `package.json`).

---

## 4. Code Efficiency & Performance

### [PERF-01] Initial Bundle Bloat (~242 KB Entry Chunk + Eager Page & Locale Imports)
- **Severity:** **High**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L1), [App.tsx](file:///d:/dev/antigravity/sport/src/App.tsx#L14-L17), [i18n/index.ts](file:///d:/dev/antigravity/sport/src/i18n/index.ts#L5-L18)
- **Problem:** Three static imports significantly inflate initial parse/download cost on mobile networks:
  1. `db.ts` line 1 statically imports `STARTER_PROGRAMS` (~55 KB of rich program descriptions and templates). Because `db.ts` is imported at startup by the root providers, `STARTER_PROGRAMS` is bundled directly into the main `index-*.js` chunk even though it is only needed as an offline/empty fallback on the Routines page!
  2. `App.tsx` eagerly imports `Exercises`, `Profile`, and `Journal` instead of `lazy()`, pulling `@mui/x-charts` (~171 KB) and heavy sub-trees upfront even when opening `/`.
  3. `src/i18n/index.ts` statically bundles all 5 locales (`en`, `de`, `fr`, `it`, `es`) upfront instead of dynamically loading non-default languages.
- **Recommended Fix:**
  - Replace `import { STARTER_PROGRAMS } from '../data/starterPrograms'` in `db.ts` with dynamic `const { STARTER_PROGRAMS } = await import('../data/starterPrograms')` inside the empty/error branches of `subscribeToProgramLibrary`.
  - Convert `Exercises`, `Profile`, and `Journal` to `lazy()` routes in `App.tsx`.
  - Optionally lazy-load non-English locale files on language change.

### [PERF-02] Live `onSnapshot` of Up to 2,000 Static Exercises on Every Session
- **Severity:** **High (Firestore Cost & Startup Memory)**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L11-L24)
- **Problem:** `/exercises` contains ~1,318 admin-curated exercises that rarely change. Subscribing via `onSnapshot` with `limit(2000)` bills ~1,318 document reads whenever a client has a cold IndexedDB cache (or when any admin updates exercises) and keeps an open real-time listener for static reference data.
- **Recommended Fix:** Fetch `/exercises` once per session with `getDocs` (using Firestore's persistent IndexedDB cache via `getDocsFromCache` + background staleness check, or storing a `catalogVersion` timestamp in metadata) instead of maintaining a permanent `onSnapshot` stream.

### [PERF-03] `O(E * W * S)` Scans & Repeated `new Date()` Parsing on Keystrokes
- **Severity:** **Medium**
- **Location:** [useWorkoutForm.ts](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L244-L258), [WorkoutDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutDetails.tsx#L88-L103)
- **Problem:**
  - In `useWorkoutForm.ts`, `previousExercisesMap` depends on `[entries, sessionExercises, id, date]`. Every time the user types a rep, weight, or note into **any** set, `sessionExercises` changes reference and recomputes `previousExercisesMap` across `entries`, calling `new Date(w.date) <= new Date(date)` inside `entries.find(...)` repeatedly!
  - In `WorkoutDetails.tsx`, PR calculation iterates over every exercise in the workout × every historical workout × every historical exercise × every set.
- **Recommended Fix:** Memoize `previousExercisesMap` keyed only by `[entries, id, date]` (building a single-pass map of the latest exercise performance across `entries` in `O(W * E)` once, independent of `sessionExercises` edits!).

### [PERF-04] Sequential Network Round-Trips in `cloneProgramFromLibrary`
- **Severity:** **Medium**
- **Location:** [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L328-L374)
- **Problem:** Cloning an 8-template program (such as 5/3/1 or PPL A/B) executes 9 sequential `await addDoc(...)` network round-trips one after another (`O(N)` latency), making the "Use Program" button feel sluggish on mobile connections.
- **Recommended Fix:** Use a single `writeBatch(db)` (which fixes both `INT-08` atomicity and reduces latency from 9 round-trips to 1).

### [PERF-05] Duplicate `program_library` Subscriptions Across List & Detail Views
- **Severity:** **Medium**
- **Location:** [ProgramLibrarySection.tsx](file:///d:/dev/antigravity/sport/src/components/routines/ProgramLibrarySection.tsx#L41-L55), [ProgramLibraryDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/ProgramLibraryDetails.tsx#L43-L61)
- **Problem:** Navigating between `/routines` (Library tab) and `/routines/library/:id` mounts and tears down separate `collection(db, 'program_library')` listeners, and `ProgramLibraryDetails` downloads the entire `/program_library` collection just to read a single document by `id`.
- **Recommended Fix:** Either add a `getProgramLibraryItem(id)` / single-doc `doc(db, 'program_library', id)` subscription in `ProgramLibraryDetails`, or cache library items in `WorkoutsContext` / a lightweight module cache.

### [PERF-06] Inline `exercises.find(...)` Inside Render Loops in `WorkoutForm`
- **Severity:** **Low**
- **Location:** [WorkoutForm.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutForm.tsx#L342-L394)
- **Problem:** `WorkoutForm.tsx` scans the 1,318-item `exercises` array with `exercises.find(ex => ex.id === se.exerciseId)` for every exercise block AND runs `exercises.filter(ex => !sessionExercises.find(...))` (`O(N * M)`) on every render/keystroke.
- **Recommended Fix:** Memoize an `exerciseMap` (`Record<string, Exercise>`) and a `Set` of active `sessionExercises` IDs via `useMemo`, just as `Journal.tsx` and `TemplatesSection.tsx` already do.

---

## 5. Code Redundancy & Dead Code

### [RED-01] Dead Page Component: `src/pages/TemplatesPage.tsx`
- **Severity:** **Medium**
- **Location:** [TemplatesPage.tsx](file:///d:/dev/antigravity/sport/src/pages/TemplatesPage.tsx#L1-L30)
- **Problem:** `TemplatesPage.tsx` is never imported in `App.tsx` or anywhere else in `src/` (superseded by the Templates tab inside `Routines.tsx`).
- **Recommended Fix:** Delete `src/pages/TemplatesPage.tsx`.

### [RED-02] Unused Exported Functions (`seedProgramLibraryToFirestore`, `updateExerciseStatus`, `calculateSetVolume`)
- **Severity:** **Medium**
- **Location:**
  - [db.ts](file:///d:/dev/antigravity/sport/src/services/db.ts#L378-L392): `seedProgramLibraryToFirestore` is unused anywhere in the codebase after removing the temporary admin seed button.
  - [exerciseUtils.ts](file:///d:/dev/antigravity/sport/src/utils/exerciseUtils.ts#L7-L38): `updateExerciseStatus` is only imported by its own unit test (`exerciseUtils.test.ts`); production code uses `updateExerciseStatusInProfile` in `db.ts` directly.
  - [fitness.ts](file:///d:/dev/antigravity/sport/src/utils/fitness.ts#L18-L20): `calculateSetVolume` is only imported by `fitness.test.ts`, while 5 components manually re-implement `((s.weight ?? 0) * (s.reps ?? 0))`!
- **Recommended Fix:** Remove `seedProgramLibraryToFirestore` and `exerciseUtils.ts` (or use `exerciseUtils.ts` for optimistic state updates), and adopt `calculateSetVolume` across workout/exercise summary components instead of repeating inline math.

### [RED-03] Unused Static Image Assets in `src/assets/`
- **Severity:** **Low**
- **Location:** `src/assets/animation-deadlift.png`, `src/assets/animation-pullups.png`, `src/assets/animation-running.png`, `src/assets/react.svg`
- **Problem:** Out of the 5 files in `src/assets/`, only `animation-benchpress.png` is referenced anywhere (`WorkoutDraftFab.tsx`, where it is confusingly imported as `runningAnim`). The other 4 files are dead repository weight.
- **Recommended Fix:** Delete unused asset files (and rename `runningAnim` to `benchpressAnim` in `WorkoutDraftFab.tsx`).

### [RED-04] Duplicated Program Library Badge/Label Helpers & Template Mapping Logic
- **Severity:** **Medium**
- **Location:**
  - [ProgramLibraryCard.tsx](file:///d:/dev/antigravity/sport/src/components/routines/ProgramLibraryCard.tsx#L30-L49) & [ProgramLibraryDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/ProgramLibraryDetails.tsx#L80-L99): Identical `getDifficultyColor`, `getGoalLabel`, and `getDifficultyLabel` functions duplicated verbatim across both files.
  - [useWorkoutForm.ts](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L137-L150) & [L367-L380](file:///d:/dev/antigravity/sport/src/hooks/useWorkoutForm.ts#L367-L380): Identical 15-line `TemplateExercise -> WorkoutExercise` mapping block duplicated inside both the URL `templateId` `useEffect` and `handleTemplateChange`.
  - [TemplatesSection.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplatesSection.tsx#L61-L72) vs. [workoutUtils.ts](file:///d:/dev/antigravity/sport/src/utils/workoutUtils.ts#L22-L31): `TemplatesSection` re-implements template sorting inline instead of calling `sortTemplates(templates)` from `workoutUtils.ts` (and subtly diverges by also sorting `isArchived` last, which `sortTemplates` in `WorkoutForm` does not!).
- **Recommended Fix:**
  - Extract `getDifficultyColor`, `getGoalLabel`, `getDifficultyLabel` into `src/utils/programUtils.ts`.
  - Extract `mapTemplateExercisesToWorkout(template, autoFill, previousMap)` in `useWorkoutForm.ts`.
  - Unify template sorting in `sortTemplates` (`workoutUtils.ts`) so archived templates are consistently sorted across both `TemplatesSection` and `WorkoutForm`.

### [RED-05] Duplicated Workout Volume / 1RM Aggregation & Superset Header Markup
- **Severity:** **Low**
- **Location:**
  - Volume/1RM loops repeated in [WorkoutItem.tsx](file:///d:/dev/antigravity/sport/src/components/journal/WorkoutItem.tsx#L38-L45), [WorkoutDetails.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutDetails.tsx#L68-L85), [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L592-L593), [ExerciseHistory.tsx](file:///d:/dev/antigravity/sport/src/pages/ExerciseHistory.tsx#L97-L102), and [ExerciseHistoryCard.tsx](file:///d:/dev/antigravity/sport/src/components/exercises/ExerciseHistoryCard.tsx#L63-L70).
  - Superset container + inline note-editor UI (~95 lines of JSX) duplicated nearly verbatim between [WorkoutForm.tsx](file:///d:/dev/antigravity/sport/src/pages/WorkoutForm.tsx#L250-L340) and [TemplateAccordion.tsx](file:///d:/dev/antigravity/sport/src/components/journal/TemplateAccordion.tsx#L374-L463).
- **Recommended Fix:** Add `summarizeExercises(exercises)` / `summarizeExerciseSets(sets)` helpers in `src/utils/fitness.ts`, and extract a reusable `<SupersetBlockCard>` component.

### [RED-06] Inconsistent Context Hook Pattern (`src/hooks/useUserProfile.ts`)
- **Severity:** **Low**
- **Location:** [useUserProfile.ts](file:///d:/dev/antigravity/sport/src/hooks/useUserProfile.ts#L1)
- **Problem:** `src/hooks/useUserProfile.ts` is a single-line pass-through (`export { useUserProfile } from '../context/UserProfileContext'`), whereas `useAuth`, `useExercises`, `useWorkouts`, and `useThemeContext` are imported directly from `src/context/*`.
- **Recommended Fix:** Standardize on importing context hooks from `src/context/*` (or barrel-exporting all context hooks consistently) and remove the redundant 1-line wrapper.

---

## Suggested Remediation Roadmap

1. **Phase 1 — Immediate Security & Critical Reliability (High Impact, Small Diff):**
   - Fix `firestore.rules` logical-`OR` vulnerability (`SEC-01`) while keeping Android compatibility, and deploy rules.
   - Gate `ExercisesContext` subscription on `currentUser` (`INT-03`) and add `onError` handlers to all `onSnapshot` calls (`INT-04`).
   - Fix `"undefinedkg"` set labels & duplicate set IDs in cloned templates (`INT-05`) and superset batch-unlink race condition (`INT-06`).
2. **Phase 2 — Data Accuracy & Cloud Functions:**
   - Resolve `WorkoutsContext` `limit(10)` truncation (`INT-01`), local date parsing (`INT-09`), `setDoc(..., { merge: true })` profile updates (`INT-07`), and Cloud Functions `'default'` database binding (`INT-02`).
3. **Phase 3 — Performance, Cleanup & i18n Polish:**
   - Lazy-load `STARTER_PROGRAMS` fallback and remaining heavy page routes (`PERF-01`), batch writes in `cloneProgramFromLibrary` (`INT-08` / `PERF-04`), remove dead files/exports (`RED-01`–`RED-04`), and translate remaining hardcoded strings across all 5 locales (`QUAL-01`).
