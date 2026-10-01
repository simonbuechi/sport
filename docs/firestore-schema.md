# Firestore Data Schema Specification

This document serves as the canonical contract between the **Sport Web App** (`sport` repo) and the **Android App** (separate repo) sharing the same Firebase project.

---

## Collections Overview

```
Firestore Root
├── exercises/ {exerciseId}                 (Global exercise catalog)
└── users/ {userId}                         (User profiles)
    ├── activities/ {activityId}            (Workout sessions / activities)
    └── templates/ {templateId}             (Workout templates)
```

---

## 1. Global Exercises Catalog: `/exercises/{exerciseId}`

Global list of exercises available to all authenticated users.

### Security Rules
- **Read**: Authenticated users (`request.auth != null`)
- **Write**: Admin only (`request.auth.uid == 'Ib3y7vFU94QZbgbXB7flrrHGbtk1'`)

### Schema
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `string` | Yes | Unique identifier (slug or doc ID) | `"bench-press"` |
| `name` | `string` | Yes | Display name of the exercise | `"Bench Press"` |
| `type` | `string` | Yes | Exercise type enum | `"strength" \| "cardio" \| "flexibility" \| "other"` |
| `bodypart` | `string` | Yes | Targeted body part | `"Chest" \| "Legs" \| "Back" \| ...` |
| `category` | `string` | Yes | Equipment category | `"Barbell" \| "Dumbbell" \| "Machine" \| "Bodyweight" \| "Cable" \| "Kettlebell"` |
| `aliases` | `string[]` | No | Search keywords / alternate names | `["Flat Bench", "Bankdrücken"]` |
| `description` | `string` | No | Explanation or guidance | `"Lie on flat bench and press..."` |
| `icon_url` | `string` | No | URL to icon or thumbnail asset | `"/assets/benchpress.png"` |
| `show` | `boolean` | No | Visibility flag in default lists | `true` |
| `popular` | `boolean` | No | Priority sorting flag | `true` |

---

## 2. User Document: `/users/{userId}`

Top-level document representing the user's profile and body metrics.

### Security Rules
- **Read / Write**: Owner only (`request.auth.uid == userId`)

### Schema
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `uid` | `string` | Yes | Matches Firebase Auth UID | `"AbCdEf123456"` |
| `name` | `string` | Yes | User display name | `"Simon"` |
| `birthYear` | `number` | No | Birth year for demographic calculations | `1990` |
| `height` | `number` | No | Body height in centimeters | `182` |
| `notes` | `string` | No | Personal fitness notes | `"Focusing on hypertrophy"` |
| `weights` | `array<WeightEntry>` | No | Historical weight records (sorted by date) | See below |
| `measurements` | `array<MeasurementEntry>`| No | Body circumference measurements | See below |
| `markedExercises` | `map<string, MarkedStatus>` | No | Favorites / notes keyed by `exerciseId` | `{"bench-press": {"favorite": true}}` |
| `settings` | `map` | No | User app preferences | `{"theme": "system", "autoFillSets": true}` |
| `updatedAt` | `string` | No | ISO timestamp of last update | `"2026-09-29T18:00:00.000Z"` |

#### Sub-object: `WeightEntry`
```typescript
{
  id: string;             // UUID or timestamp string
  date: string;           // ISO date string "YYYY-MM-DD"
  weightKg: number;       // e.g. 78.5
  bodyFatPercent?: number // e.g. 15.2
}
```

#### Sub-object: `MeasurementEntry`
```typescript
{
  id: string;             // UUID or timestamp string
  date: string;           // ISO date string "YYYY-MM-DD"
  waist?: number;         // in cm
  hips?: number;          // in cm
  neck?: number;          // in cm
  chest?: number;         // in cm
  shoulders?: number;     // in cm
  rightBicep?: number;    // in cm
  leftBicep?: number;     // in cm
  rightForearm?: number;  // in cm
  leftForearm?: number;   // in cm
  rightThigh?: number;    // in cm
  leftThigh?: number;     // in cm
  rightCalf?: number;     // in cm
  leftCalf?: number;      // in cm
}
```

---

## 3. Activities Subcollection: `/users/{userId}/activities/{activityId}`

Represents completed workout sessions logged by either Web or Android app.

### Security Rules
- **Read / Write**: Owner only (`request.auth.uid == userId`)
- **Validation**: Requires `date` (`string`) and `exercises` (`list`)

### Schema
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `string` | Yes | Firestore document ID | `"act_987654"` |
| `userId` | `string` | Yes | Matches `userId` in path | `"AbCdEf123456"` |
| `date` | `string` | Yes | Date string (ISO formatted) | `"2026-09-29"` |
| `time` | `string` | No | Start time ("HH:mm") | `"17:30"` |
| `length` | `number` | No | Workout duration in minutes | `65` |
| `sessionType` | `string` | No | `"strength" \| "cardio" \| ...` | `"strength"` |
| `intensity` | `number` | No | Subjective intensity (1 to 5) | `4` |
| `maxPulse` | `number` | No | Peak heart rate | `165` |
| `comment` | `string` | No | Notes or comments | `"Felt strong on bench today"` |
| `exerciseIds` | `string[]` | Yes | List of exercise IDs performed | `["bench-press", "pull-ups"]` |
| `exercises` | `array<WorkoutExercise>` | Yes | Detailed exercises and sets | See below |
| `templateId` | `string` | No | ID of template used (references `/templates/{templateId}`) | `"tpl_123"` |

> **Note on Template Referencing**:
> When a workout is created from a template, `templateId` is attached to the workout record. Even if the user adapts the workout (adds/removes exercises or adjusts sets), `templateId` remains linked so users can track workout history by routine.

#### Sub-object: `WorkoutExercise`
```typescript
{
  exerciseId: string;     // References /exercises/{exerciseId}
  note?: string;          // Exercise-specific note
  sets: Array<{
    id: string;           // Set identifier (UUID)
    weight?: number;      // in kg
    reps?: number;        // repetition count
    notes?: string;       // set notes (e.g. "RPE 8")
  }>;
}
```

---

## 4. Templates Subcollection: `/users/{userId}/templates/{templateId}`

Predefined workout routines for quick-starting workouts.

### Security Rules
- **Read / Write**: Owner only (`request.auth.uid == userId`)
- **Validation**: Requires `name` (`string`) and `exercises` (`list`)

### Schema
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `id` | `string` | Yes | Document ID | `"tpl_123"` |
| `userId` | `string` | Yes | Owner UID | `"AbCdEf123456"` |
| `name` | `string` | Yes | Routine name | `"Push Day A"` |
| `notes` | `string` | No | Description / guidance | `"Chest, shoulders, triceps"` |
| `isFavorite` | `boolean` | No | Favorite flag | `true` |
| `isArchived` | `boolean` | No | Archive flag | `false` |
| `exercises` | `array<TemplateExercise>` | Yes | Planned exercises and target sets | See below |

---

## 5. Cloud Functions Integration

Cloud Functions automatically run in response to activity writes:
- **`onActivityCreated`**: Listens on `users/{userId}/activities/{activityId}` `onCreate`.
  - Updates `lastActivityAt` on `/users/{userId}`.
  - Future: Dispatches push notifications / milestone alerts when FCM is configured.
