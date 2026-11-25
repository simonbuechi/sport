import type { ProgramLibraryItem } from '../types';

export const STARTER_PROGRAMS: ProgramLibraryItem[] = [
    // 1. Ganzkörper (Full Body A/B - 2-Week Alternating Cycle)
    {
        id: 'ganzkorper-full-body-ab',
        name: 'Ganzkörper (Full Body A/B)',
        description:
            'Science-backed 3-day/week Full Body routine alternating Workout A and Workout B over a 2-week (14-day) cycle. By rotating movement patterns (Squat vs. Hinge, Horizontal vs. Vertical Push/Pull), you stimulate every major muscle group 3x/week while avoiding overuse and maximizing recovery. Progression: Double progression — add weight once you hit the top of the rep range for all working sets at RPE 8–9.',
        type: 'repetitive',
        difficulty: 'beginner',
        goal: 'fitness',
        daysPerWeek: 3,
        durationDays: 14,
        author: 'Sport Amigo Team',
        days: [
            { id: 'gk-d1', dayNumber: 1, templateKey: 'gk_a', note: 'Week 1 — Workout A: Quad-dominant squat, horizontal push, vertical pull & side delts.' },
            { id: 'gk-d2', dayNumber: 2, templateKey: null, note: 'Rest & Recovery: 48h muscle protein synthesis window; light walking or mobility.' },
            { id: 'gk-d3', dayNumber: 3, templateKey: 'gk_b', note: 'Week 1 — Workout B: Hip hinge (posterior chain), vertical push, horizontal pull & unilateral legs.' },
            { id: 'gk-d4', dayNumber: 4, templateKey: null, note: 'Rest & Recovery: Focus on sleep (7–9h) and adequate protein intake.' },
            { id: 'gk-d5', dayNumber: 5, templateKey: 'gk_a', note: 'Week 1 — Workout A: Second exposure to Squat & Bench pattern this week.' },
            { id: 'gk-d6', dayNumber: 6, templateKey: null, note: 'Weekend Active Recovery: Light cardio, stretching, or outdoor activity.' },
            { id: 'gk-d7', dayNumber: 7, templateKey: null, note: 'Full Rest Day before Week 2.' },
            { id: 'gk-d8', dayNumber: 8, templateKey: 'gk_b', note: 'Week 2 — Workout B: Starts the week with Deadlift/Hinge & Overhead Press focus.' },
            { id: 'gk-d9', dayNumber: 9, templateKey: null, note: 'Rest & Recovery.' },
            { id: 'gk-d10', dayNumber: 10, templateKey: 'gk_a', note: 'Week 2 — Workout A: Quad-dominant & horizontal pressing focus.' },
            { id: 'gk-d11', dayNumber: 11, templateKey: null, note: 'Rest & Recovery.' },
            { id: 'gk-d12', dayNumber: 12, templateKey: 'gk_b', note: 'Week 2 — Workout B: Second exposure to Hinge & OHP pattern this week.' },
            { id: 'gk-d13', dayNumber: 13, templateKey: null, note: 'Weekend Active Recovery.' },
            { id: 'gk-d14', dayNumber: 14, templateKey: null, note: 'Full Rest Day before repeating the 2-week cycle.' },
        ],
        templates: {
            gk_a: {
                name: 'Full Body A (Squat & Horizontal Push)',
                notes: 'Focus: Quad-dominant lower body, horizontal chest press, vertical lat pull, and lateral delts. Rest 2–3 min on Squat/Bench, 60–90s on accessories. Leave 1–2 reps in reserve (RPE 8).',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: 'Primary knee-dominant compound (6–8 reps). Controls depth and quad hypertrophy.',
                        sets: [
                            { id: 'gka-1', reps: 8, weight: 60, rpe: 7.5 },
                            { id: 'gka-2', reps: 8, weight: 60, rpe: 8 },
                            { id: 'gka-3', reps: 8, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: 'Horizontal push (8–10 reps). Retract scapulae and control the eccentric.',
                        sets: [
                            { id: 'gka-4', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gka-5', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gka-6', reps: 10, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: 'Vertical pull (8–12 reps) for lat width and upper-back balance.',
                        sets: [
                            { id: 'gka-7', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gka-8', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gka-9', reps: 10, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: 'Knee-flexion hamstring work (10–12 reps) to balance quad-heavy squats.',
                        sets: [
                            { id: 'gka-10', reps: 12, weight: 40, rpe: 8 },
                            { id: 'gka-11', reps: 12, weight: 40, rpe: 8.5 },
                            { id: 'gka-12', reps: 12, weight: 40, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: 'Side-delt isolation (12–15 reps) for shoulder width.',
                        sets: [
                            { id: 'gka-13', reps: 15, weight: 8, rpe: 8 },
                            { id: 'gka-14', reps: 15, weight: 8, rpe: 8.5 },
                            { id: 'gka-15', reps: 15, weight: 8, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        note: 'Triceps isolation finisher (10–12 reps).',
                        sets: [
                            { id: 'gka-16', reps: 12, weight: 20, rpe: 8.5 },
                            { id: 'gka-17', reps: 12, weight: 20, rpe: 9 },
                        ]
                    }
                ]
            },
            gk_b: {
                name: 'Full Body B (Hinge & Vertical Push)',
                notes: 'Focus: Posterior-chain hip hinge, vertical shoulder pressing, horizontal rowing, and unilateral leg stability. Rest 2–3 min on RDL/OHP, 60–90s on accessories.',
                exercises: [
                    {
                        exerciseId: 'u4J5KLxDobxD5pFJPW1i',
                        exerciseName: 'Romanian Deadlift',
                        note: 'Primary hip hinge (6–8 reps). Targets hamstrings, glutes, and spinal erectors.',
                        sets: [
                            { id: 'gkb-1', reps: 8, weight: 70, rpe: 7.5 },
                            { id: 'gkb-2', reps: 8, weight: 70, rpe: 8 },
                            { id: 'gkb-3', reps: 8, weight: 70, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: 'Vertical push (8–10 reps). Brace glutes and core; press in a vertical bar path.',
                        sets: [
                            { id: 'gkb-4', reps: 8, weight: 35, rpe: 8 },
                            { id: 'gkb-5', reps: 8, weight: 35, rpe: 8 },
                            { id: 'gkb-6', reps: 8, weight: 35, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: 'Horizontal pull (8–10 reps) for mid-back thickness and posture.',
                        sets: [
                            { id: 'gkb-7', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gkb-8', reps: 10, weight: 50, rpe: 8 },
                            { id: 'gkb-9', reps: 10, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'dWsWDDAlGluYnHEtp0Pu',
                        exerciseName: 'Bulgarian Split Squat',
                        note: 'Unilateral quad/glute work (8–10 reps/leg) to fix left-right imbalances.',
                        sets: [
                            { id: 'gkb-10', reps: 10, weight: 14, rpe: 8 },
                            { id: 'gkb-11', reps: 10, weight: 14, rpe: 8.5 },
                            { id: 'gkb-12', reps: 10, weight: 14, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'B7LuU3lYXyD10saX4Ly4',
                        exerciseName: 'Dumbbell Curl',
                        note: 'Direct biceps work (10–12 reps), strict form without swinging.',
                        sets: [
                            { id: 'gkb-13', reps: 12, weight: 12, rpe: 8.5 },
                            { id: 'gkb-14', reps: 12, weight: 12, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'AKU96E3Mav0ix07oYEnS',
                        exerciseName: 'Hanging Leg Raise',
                        note: 'Anterior core strength (12–15 reps). Curl pelvis upward.',
                        sets: [
                            { id: 'gkb-15', reps: 12, rpe: 8 },
                            { id: 'gkb-16', reps: 12, rpe: 8.5 },
                        ]
                    }
                ]
            }
        }
    },

    // 2. StrongLifts 5x5 / Starting Strength (2-Week A/B Alternating Linear Progression)
    {
        id: 'stronglifts-5x5-starting-strength',
        name: 'StrongLifts 5x5 / Starting Strength',
        description:
            'The classic 3-day/week barbell linear progression program alternating Workout A and Workout B across a 14-day cycle (Week 1: A-B-A, Week 2: B-A-B). Built around heavy compound lifts for 5x5 (1x5 on Deadlift). Progression Rule: Add +2.5 kg to Squat, Bench, OHP, and Row every completed session, and +5 kg to Deadlift. If you stall 3 times in a row on a lift, deload that lift by 10% and build back up.',
        type: 'repetitive',
        difficulty: 'beginner',
        goal: 'strength',
        daysPerWeek: 3,
        durationDays: 14,
        author: 'Mehdi / Mark Rippetoe Classic',
        days: [
            { id: 'sl-d1', dayNumber: 1, templateKey: 'sl_a', note: 'Week 1 — Workout A: Squat + Bench Press + Barbell Row (5x5).' },
            { id: 'sl-d2', dayNumber: 2, templateKey: null, note: 'Rest Day: Crucial for CNS recovery and linear strength gains.' },
            { id: 'sl-d3', dayNumber: 3, templateKey: 'sl_b', note: 'Week 1 — Workout B: Squat + Overhead Press (5x5) + Deadlift (1x5).' },
            { id: 'sl-d4', dayNumber: 4, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d5', dayNumber: 5, templateKey: 'sl_a', note: 'Week 1 — Workout A: Add +2.5 kg to Monday weights if all 5x5 sets succeeded.' },
            { id: 'sl-d6', dayNumber: 6, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d7', dayNumber: 7, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d8', dayNumber: 8, templateKey: 'sl_b', note: 'Week 2 — Workout B: Add +2.5 kg to Squat/OHP and +5 kg to Deadlift.' },
            { id: 'sl-d9', dayNumber: 9, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d10', dayNumber: 10, templateKey: 'sl_a', note: 'Week 2 — Workout A: Add +2.5 kg to all lifts from last Workout A.' },
            { id: 'sl-d11', dayNumber: 11, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d12', dayNumber: 12, templateKey: 'sl_b', note: 'Week 2 — Workout B: Add +2.5 kg to Squat/OHP and +5 kg to Deadlift.' },
            { id: 'sl-d13', dayNumber: 13, templateKey: null, note: 'Rest Day.' },
            { id: 'sl-d14', dayNumber: 14, templateKey: null, note: 'Rest Day before restarting Week 1.' },
        ],
        templates: {
            sl_a: {
                name: 'StrongLifts Workout A (5x5)',
                notes: 'Focus: Maximal linear strength on Squat, Bench Press, and Pendlay/Barbell Row. Perform 2–3 light warm-up sets before your 5 working sets. Rest 90s when light, 3–5 min when heavy.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: '5x5 same working weight. Break parallel on every rep; add +2.5 kg next session if all 25 reps succeed.',
                        sets: [
                            { id: 'sla-1', reps: 5, weight: 60, rpe: 7.5 },
                            { id: 'sla-2', reps: 5, weight: 60, rpe: 7.5 },
                            { id: 'sla-3', reps: 5, weight: 60, rpe: 8 },
                            { id: 'sla-4', reps: 5, weight: 60, rpe: 8 },
                            { id: 'sla-5', reps: 5, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: '5x5 same working weight. Touch mid-chest with control, press explosively. Add +2.5 kg next A day.',
                        sets: [
                            { id: 'sla-6', reps: 5, weight: 50, rpe: 7.5 },
                            { id: 'sla-7', reps: 5, weight: 50, rpe: 8 },
                            { id: 'sla-8', reps: 5, weight: 50, rpe: 8 },
                            { id: 'sla-9', reps: 5, weight: 50, rpe: 8.5 },
                            { id: 'sla-10', reps: 5, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: '5x5 Pendlay-style from the floor each rep (or strict bent-over). Pull to lower chest.',
                        sets: [
                            { id: 'sla-11', reps: 5, weight: 45, rpe: 7.5 },
                            { id: 'sla-12', reps: 5, weight: 45, rpe: 8 },
                            { id: 'sla-13', reps: 5, weight: 45, rpe: 8 },
                            { id: 'sla-14', reps: 5, weight: 45, rpe: 8 },
                            { id: 'sla-15', reps: 5, weight: 45, rpe: 8.5 },
                        ]
                    }
                ]
            },
            sl_b: {
                name: 'StrongLifts Workout B (5x5 + 1x5 Deadlift)',
                notes: 'Focus: Squat progression + vertical pressing strength (OHP) + heavy posterior-chain pull (1x5 Deadlift). Deadlift is 1 top working set because systemic fatigue is high after 5x5 Squats.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: '5x5 same working weight. Squat every session to master technique and drive lower-body strength.',
                        sets: [
                            { id: 'slb-1', reps: 5, weight: 62.5, rpe: 7.5 },
                            { id: 'slb-2', reps: 5, weight: 62.5, rpe: 8 },
                            { id: 'slb-3', reps: 5, weight: 62.5, rpe: 8 },
                            { id: 'slb-4', reps: 5, weight: 62.5, rpe: 8.5 },
                            { id: 'slb-5', reps: 5, weight: 62.5, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: '5x5 strict standing press. No leg drive; squeeze glutes and abs. Add +2.5 kg when all 5x5 succeed.',
                        sets: [
                            { id: 'slb-6', reps: 5, weight: 35, rpe: 7.5 },
                            { id: 'slb-7', reps: 5, weight: 35, rpe: 8 },
                            { id: 'slb-8', reps: 5, weight: 35, rpe: 8 },
                            { id: 'slb-9', reps: 5, weight: 35, rpe: 8.5 },
                            { id: 'slb-10', reps: 5, weight: 35, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'W0YdnVZE7hZLaeapNAJm',
                        exerciseName: 'Deadlift',
                        note: '1x5 top working set (after 2–3 ramp-up warm-up sets). Reset on the floor each rep. Add +5 kg next B day.',
                        sets: [
                            { id: 'slb-11', reps: 5, weight: 80, rpe: 8.5 },
                        ]
                    }
                ]
            }
        }
    },

    // 3. Oberkörper / Unterkörper (OK/UK — Upper / Lower A & B)
    {
        id: 'oberkorper-unterkorper-ab',
        name: 'Oberkörper / Unterkörper (OK/UK)',
        description:
            'Classic 4-day Upper/Lower split with dedicated A and B variants. Each muscle group is trained 2x/week with optimal 48–72h recovery. Workout A emphasizes flat/quad-dominant barbell compounds, while Workout B emphasizes incline/vertical upper work and hip-hinge/unilateral lower work for balanced hypertrophy and joint health.',
        type: 'repetitive',
        difficulty: 'intermediate',
        goal: 'hypertrophy',
        daysPerWeek: 4,
        durationDays: 7,
        author: 'Sport Amigo Team',
        days: [
            { id: 'okuk-d1', dayNumber: 1, templateKey: 'ok_a', note: 'Upper A: Horizontal push/pull & heavy compound focus.' },
            { id: 'okuk-d2', dayNumber: 2, templateKey: 'uk_a', note: 'Lower A: Quad-dominant (Squat + Leg Press) & hamstring balance.' },
            { id: 'okuk-d3', dayNumber: 3, templateKey: null, note: 'Mid-week Rest Day: Recovery before B rotations.' },
            { id: 'okuk-d4', dayNumber: 4, templateKey: 'ok_b', note: 'Upper B: Incline push, vertical pull & shoulder/arm detail.' },
            { id: 'okuk-d5', dayNumber: 5, templateKey: 'uk_b', note: 'Lower B: Posterior chain / Hinge (Deadlift) & unilateral legs.' },
            { id: 'okuk-d6', dayNumber: 6, templateKey: null, note: 'Weekend Rest / Active Recovery.' },
            { id: 'okuk-d7', dayNumber: 7, templateKey: null, note: 'Full Rest Day.' },
        ],
        templates: {
            ok_a: {
                name: 'Upper Body A (Horizontal Focus)',
                notes: 'Focus: Heavy horizontal pressing and rowing paired with vertical shoulder/lat balance. Rest 2–3 min on compounds, 60–90s on isolations. Target 1–2 RIR (RPE 8–9).',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: 'Primary horizontal press (6–8 reps) for chest & triceps mechanical tension.',
                        sets: [
                            { id: 'oka-1', reps: 8, weight: 70, rpe: 8 },
                            { id: 'oka-2', reps: 8, weight: 70, rpe: 8.5 },
                            { id: 'oka-3', reps: 8, weight: 70, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: 'Primary horizontal pull (6–8 reps) for upper/mid-back thickness.',
                        sets: [
                            { id: 'oka-4', reps: 8, weight: 60, rpe: 8 },
                            { id: 'oka-5', reps: 8, weight: 60, rpe: 8.5 },
                            { id: 'oka-6', reps: 8, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: 'Vertical press (8–10 reps) for anterior delts.',
                        sets: [
                            { id: 'oka-7', reps: 10, weight: 40, rpe: 8 },
                            { id: 'oka-8', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'oka-9', reps: 10, weight: 40, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: 'Vertical pull (8–12 reps) for lat width.',
                        sets: [
                            { id: 'oka-10', reps: 10, weight: 55, rpe: 8 },
                            { id: 'oka-11', reps: 10, weight: 55, rpe: 8.5 },
                            { id: 'oka-12', reps: 10, weight: 55, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: 'Side-delt hypertrophy (12–15 reps).',
                        sets: [
                            { id: 'oka-13', reps: 15, weight: 10, rpe: 8.5 },
                            { id: 'oka-14', reps: 15, weight: 10, rpe: 9 },
                            { id: 'oka-15', reps: 15, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        supersetId: 'oka_arms',
                        supersetNote: 'Arm superset finisher to save time',
                        sets: [
                            { id: 'oka-16', reps: 12, weight: 25, rpe: 8.5 },
                            { id: 'oka-17', reps: 12, weight: 25, rpe: 9 },
                            { id: 'oka-18', reps: 12, weight: 25, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'jt4d6gmDQ2WjvrcledxQ',
                        exerciseName: 'Barbell Curl',
                        supersetId: 'oka_arms',
                        supersetNote: 'Arm superset finisher to save time',
                        sets: [
                            { id: 'oka-19', reps: 12, weight: 30, rpe: 8.5 },
                            { id: 'oka-20', reps: 12, weight: 30, rpe: 9 },
                            { id: 'oka-21', reps: 12, weight: 30, rpe: 9 },
                        ]
                    }
                ]
            },
            uk_a: {
                name: 'Lower Body A (Quad-Dominant)',
                notes: 'Focus: Squat & Leg Press for quad sweep/strength, paired with RDLs for posterior-chain balance, plus calves and abs.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: 'Primary quad compound (6–8 reps). Full depth, brace core.',
                        sets: [
                            { id: 'uka-1', reps: 8, weight: 90, rpe: 8 },
                            { id: 'uka-2', reps: 8, weight: 90, rpe: 8.5 },
                            { id: 'uka-3', reps: 8, weight: 90, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'u4J5KLxDobxD5pFJPW1i',
                        exerciseName: 'Romanian Deadlift',
                        note: 'Hamstring stretch & glute load (8–10 reps).',
                        sets: [
                            { id: 'uka-4', reps: 10, weight: 80, rpe: 8 },
                            { id: 'uka-5', reps: 10, weight: 80, rpe: 8 },
                            { id: 'uka-6', reps: 10, weight: 80, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'zlS0WcB2Vm6f7bQNij1f',
                        exerciseName: 'Sled Leg Press',
                        note: 'High-volume quad builder (10–12 reps) without spinal loading.',
                        sets: [
                            { id: 'uka-7', reps: 12, weight: 140, rpe: 8.5 },
                            { id: 'uka-8', reps: 12, weight: 140, rpe: 8.5 },
                            { id: 'uka-9', reps: 12, weight: 140, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: 'Isolated knee flexion (10–12 reps).',
                        sets: [
                            { id: 'uka-10', reps: 12, weight: 45, rpe: 8.5 },
                            { id: 'uka-11', reps: 12, weight: 45, rpe: 9 },
                            { id: 'uka-12', reps: 12, weight: 45, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'HMkm6ymh9vFVuCdZJB6d',
                        exerciseName: 'Barbell Calf Raise',
                        note: 'Straight-leg gastrocnemius focus (10–15 reps), pause at bottom stretch.',
                        sets: [
                            { id: 'uka-13', reps: 15, weight: 50, rpe: 8.5 },
                            { id: 'uka-14', reps: 15, weight: 50, rpe: 9 },
                            { id: 'uka-15', reps: 15, weight: 50, rpe: 9 },
                            { id: 'uka-16', reps: 15, weight: 50, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'AKU96E3Mav0ix07oYEnS',
                        exerciseName: 'Hanging Leg Raise',
                        note: 'Core finisher (12–15 reps).',
                        sets: [
                            { id: 'uka-17', reps: 15, rpe: 8 },
                            { id: 'uka-18', reps: 15, rpe: 8.5 },
                            { id: 'uka-19', reps: 15, rpe: 9 },
                        ]
                    }
                ]
            },
            ok_b: {
                name: 'Upper Body B (Vertical & Incline Focus)',
                notes: 'Focus: Upper chest (incline), chest-supported rowing (saves lower back), vertical pull-ups, and isolation arm/delt work.',
                exercises: [
                    {
                        exerciseId: 'fX5K9VFoTDjPiLqjYlEB',
                        exerciseName: 'Incline Dumbbell Bench Press',
                        note: 'Upper chest focus (8–10 reps) with deep dumbbell stretch.',
                        sets: [
                            { id: 'okb-1', reps: 10, weight: 26, rpe: 8 },
                            { id: 'okb-2', reps: 10, weight: 26, rpe: 8.5 },
                            { id: 'okb-3', reps: 10, weight: 26, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: '6LqQ85QPHp1bfzh3Z4lk',
                        exerciseName: 'Seated Cable Row',
                        note: 'Mid-back thickness (8–10 reps) with controlled squeeze.',
                        sets: [
                            { id: 'okb-4', reps: 10, weight: 55, rpe: 8 },
                            { id: 'okb-5', reps: 10, weight: 55, rpe: 8.5 },
                            { id: 'okb-6', reps: 10, weight: 55, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'G2PLJr9dtJwlDR3szd7a',
                        exerciseName: 'Dumbbell Shoulder Press',
                        note: 'Seated vertical press (8–10 reps) for shoulder stability.',
                        sets: [
                            { id: 'okb-7', reps: 10, weight: 20, rpe: 8 },
                            { id: 'okb-8', reps: 10, weight: 20, rpe: 8.5 },
                            { id: 'okb-9', reps: 10, weight: 20, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: '2oEkViofmMxIUFoURTV1',
                        exerciseName: 'Pull Ups',
                        note: 'Bodyweight or assisted vertical pull (8–12 reps).',
                        sets: [
                            { id: 'okb-10', reps: 10, rpe: 8 },
                            { id: 'okb-11', reps: 10, rpe: 8.5 },
                            { id: 'okb-12', reps: 8, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'DBqcbgRDrW48atZSwI7g',
                        exerciseName: 'Cable Lateral Raise',
                        note: 'Constant-tension side delt isolation (12–15 reps).',
                        sets: [
                            { id: 'okb-13', reps: 15, weight: 7.5, rpe: 8.5 },
                            { id: 'okb-14', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'okb-15', reps: 15, weight: 7.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'AefeyCyJzP7BP7OHbxOW',
                        exerciseName: 'Cable Overhead Tricep Extension',
                        supersetId: 'okb_arms',
                        supersetNote: 'Long-head triceps & brachialis superset',
                        sets: [
                            { id: 'okb-16', reps: 12, weight: 22.5, rpe: 8.5 },
                            { id: 'okb-17', reps: 12, weight: 22.5, rpe: 9 },
                            { id: 'okb-18', reps: 12, weight: 22.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'XdY3WMluqQvjIjLinnjW',
                        exerciseName: 'Hammer Curl',
                        supersetId: 'okb_arms',
                        supersetNote: 'Long-head triceps & brachialis superset',
                        sets: [
                            { id: 'okb-19', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'okb-20', reps: 12, weight: 14, rpe: 9 },
                            { id: 'okb-21', reps: 12, weight: 14, rpe: 9 },
                        ]
                    }
                ]
            },
            uk_b: {
                name: 'Lower Body B (Hinge & Unilateral Focus)',
                notes: 'Focus: Heavy hinge (Deadlift) + single-leg hypertrophy (Bulgarian Split Squats) + machine quad/hamstring isolation & soleus calves.',
                exercises: [
                    {
                        exerciseId: 'W0YdnVZE7hZLaeapNAJm',
                        exerciseName: 'Deadlift',
                        note: 'Primary posterior-chain pull (5–6 reps). Reset cleanly on each rep.',
                        sets: [
                            { id: 'ukb-1', reps: 5, weight: 110, rpe: 8 },
                            { id: 'ukb-2', reps: 5, weight: 110, rpe: 8.5 },
                            { id: 'ukb-3', reps: 5, weight: 110, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'dWsWDDAlGluYnHEtp0Pu',
                        exerciseName: 'Bulgarian Split Squat',
                        note: 'Single-leg quad/glute builder (8–10 reps/leg).',
                        sets: [
                            { id: 'ukb-4', reps: 10, weight: 16, rpe: 8 },
                            { id: 'ukb-5', reps: 10, weight: 16, rpe: 8.5 },
                            { id: 'ukb-6', reps: 10, weight: 16, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'bx80cW4sbNnxQxhkXtV5',
                        exerciseName: 'Leg Extension',
                        note: 'Direct rectus femoris / quad isolation (12–15 reps).',
                        sets: [
                            { id: 'ukb-7', reps: 15, weight: 50, rpe: 8.5 },
                            { id: 'ukb-8', reps: 15, weight: 50, rpe: 9 },
                            { id: 'ukb-9', reps: 15, weight: 50, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: 'High-rep hamstring pump (12–15 reps).',
                        sets: [
                            { id: 'ukb-10', reps: 15, weight: 40, rpe: 8.5 },
                            { id: 'ukb-11', reps: 15, weight: 40, rpe: 9 },
                            { id: 'ukb-12', reps: 15, weight: 40, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'cfzkYu8HLFu6gtUWcHbZ',
                        exerciseName: 'Seated Calf Raise',
                        note: 'Bent-knee soleus focus (12–15 reps).',
                        sets: [
                            { id: 'ukb-13', reps: 15, weight: 35, rpe: 8.5 },
                            { id: 'ukb-14', reps: 15, weight: 35, rpe: 9 },
                            { id: 'ukb-15', reps: 15, weight: 35, rpe: 9 },
                            { id: 'ukb-16', reps: 15, weight: 35, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'jblEAJWGAr0cGrBCHPXu',
                        exerciseName: 'Plank',
                        note: 'Isometric core stability finisher (60s holds).',
                        sets: [
                            { id: 'ukb-17', reps: 60, rpe: 8 },
                            { id: 'ukb-18', reps: 60, rpe: 8.5 },
                        ]
                    }
                ]
            }
        }
    },

    // 4. Push / Pull / Legs (PPL A/B - 6-Day Split)
    {
        id: 'push-pull-legs-ab-6day',
        name: 'Push / Pull / Legs (PPL A/B)',
        description:
            'Gold-standard 6-day Push/Pull/Legs split with distinct A (Heavy / Mechanical Tension) and B (Volume / Hypertrophy) rotations. Groups muscles by movement pattern so pushing, pulling, and leg muscles get 2x weekly frequency without overlapping fatigue. Deload every 6–8 weeks if joint or CNS fatigue accumulates.',
        type: 'repetitive',
        difficulty: 'intermediate',
        goal: 'hypertrophy',
        daysPerWeek: 6,
        durationDays: 7,
        author: 'Sport Amigo Team',
        days: [
            { id: 'ppl-d1', dayNumber: 1, templateKey: 'ppl_push_a', note: 'Push A: Heavy barbell/dumbbell pressing & mechanical tension.' },
            { id: 'ppl-d2', dayNumber: 2, templateKey: 'ppl_pull_a', note: 'Pull A: Heavy barbell rows, vertical pulls & posterior chain.' },
            { id: 'ppl-d3', dayNumber: 3, templateKey: 'ppl_legs_a', note: 'Legs A: Heavy Back Squats, RDLs & Leg Press.' },
            { id: 'ppl-d4', dayNumber: 4, templateKey: 'ppl_push_b', note: 'Push B: Higher-rep hypertrophy, deep stretch & cable isolation.' },
            { id: 'ppl-d5', dayNumber: 5, templateKey: 'ppl_pull_b', note: 'Pull B: Lat width, chest-supported rows & rear-delt detail.' },
            { id: 'ppl-d6', dayNumber: 6, templateKey: 'ppl_legs_b', note: 'Legs B: Unilateral work (Split Squats/Lunges) & isolation.' },
            { id: 'ppl-d7', dayNumber: 7, templateKey: null, note: 'Rest Day: Complete recovery before repeating the 6-day rotation.' },
        ],
        templates: {
            ppl_push_a: {
                name: 'Push A (Heavy Mechanical Tension)',
                notes: 'Focus: Low-to-moderate rep compound pressing (4–8 reps) for chest, front delts, and triceps. Rest 2–3 min on heavy sets; leave 1–2 RIR (RPE 8).',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: 'Heavy primary press (4–6 reps).',
                        sets: [
                            { id: 'ppla-1', reps: 5, weight: 80, rpe: 8 },
                            { id: 'ppla-2', reps: 5, weight: 80, rpe: 8 },
                            { id: 'ppla-3', reps: 5, weight: 80, rpe: 8.5 },
                            { id: 'ppla-4', reps: 5, weight: 80, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'fX5K9VFoTDjPiLqjYlEB',
                        exerciseName: 'Incline Dumbbell Bench Press',
                        note: 'Upper chest mass (6–8 reps), controlled eccentric.',
                        sets: [
                            { id: 'ppla-5', reps: 8, weight: 28, rpe: 8 },
                            { id: 'ppla-6', reps: 8, weight: 28, rpe: 8.5 },
                            { id: 'ppla-7', reps: 8, weight: 28, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: 'Standing barbell press (6–8 reps) for anterior delts.',
                        sets: [
                            { id: 'ppla-8', reps: 8, weight: 45, rpe: 8 },
                            { id: 'ppla-9', reps: 8, weight: 45, rpe: 8.5 },
                            { id: 'ppla-10', reps: 8, weight: 45, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: 'Side-delt width (10–15 reps).',
                        sets: [
                            { id: 'ppla-11', reps: 12, weight: 10, rpe: 8.5 },
                            { id: 'ppla-12', reps: 12, weight: 10, rpe: 9 },
                            { id: 'ppla-13', reps: 12, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '813mOmBKNITbWd7d6WIq',
                        exerciseName: 'Close Grip Bench Press',
                        note: 'Heavy triceps overload (6–10 reps).',
                        sets: [
                            { id: 'ppla-14', reps: 8, weight: 60, rpe: 8 },
                            { id: 'ppla-15', reps: 8, weight: 60, rpe: 8.5 },
                            { id: 'ppla-16', reps: 8, weight: 60, rpe: 9 },
                        ]
                    }
                ]
            },
            ppl_pull_a: {
                name: 'Pull A (Heavy Thickness Focus)',
                notes: 'Focus: Heavy rowing and vertical pulling for back density, plus rear-delt health (Face Pulls) and heavy biceps.',
                exercises: [
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: 'Heavy back thickness (4–6 reps). Keep torso stable.',
                        sets: [
                            { id: 'plla-1', reps: 6, weight: 75, rpe: 8 },
                            { id: 'plla-2', reps: 6, weight: 75, rpe: 8 },
                            { id: 'plla-3', reps: 6, weight: 75, rpe: 8.5 },
                            { id: 'plla-4', reps: 6, weight: 75, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: '2oEkViofmMxIUFoURTV1',
                        exerciseName: 'Pull Ups',
                        note: 'Full range of motion vertical pull (6–8 reps). Add weight if needed.',
                        sets: [
                            { id: 'plla-5', reps: 8, rpe: 8 },
                            { id: 'plla-6', reps: 8, rpe: 8.5 },
                            { id: 'plla-7', reps: 8, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '6LqQ85QPHp1bfzh3Z4lk',
                        exerciseName: 'Seated Cable Row',
                        note: 'Mid-back squeeze (8–10 reps).',
                        sets: [
                            { id: 'plla-8', reps: 10, weight: 60, rpe: 8 },
                            { id: 'plla-9', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'plla-10', reps: 10, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'rXi6Xy7qcZUPxM4r8uPJ',
                        exerciseName: 'Face Pull',
                        note: 'Rear delts & external rotators for shoulder health (12–15 reps).',
                        sets: [
                            { id: 'plla-11', reps: 15, weight: 20, rpe: 8 },
                            { id: 'plla-12', reps: 15, weight: 20, rpe: 8.5 },
                            { id: 'plla-13', reps: 15, weight: 20, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'jt4d6gmDQ2WjvrcledxQ',
                        exerciseName: 'Barbell Curl',
                        note: 'Strict biceps curl (8–12 reps).',
                        sets: [
                            { id: 'plla-14', reps: 10, weight: 32.5, rpe: 8.5 },
                            { id: 'plla-15', reps: 10, weight: 32.5, rpe: 9 },
                            { id: 'plla-16', reps: 10, weight: 32.5, rpe: 9 },
                        ]
                    }
                ]
            },
            ppl_legs_a: {
                name: 'Legs A (Heavy Compound Focus)',
                notes: 'Focus: Heavy axial loading (Back Squat + RDL) followed by Leg Press, Leg Curl, and Standing Calf Raises.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: 'Heavy quad/glute foundation (4–6 reps).',
                        sets: [
                            { id: 'lga-1', reps: 6, weight: 100, rpe: 8 },
                            { id: 'lga-2', reps: 6, weight: 100, rpe: 8 },
                            { id: 'lga-3', reps: 6, weight: 100, rpe: 8.5 },
                            { id: 'lga-4', reps: 6, weight: 100, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'u4J5KLxDobxD5pFJPW1i',
                        exerciseName: 'Romanian Deadlift',
                        note: 'Posterior chain stretch (6–8 reps).',
                        sets: [
                            { id: 'lga-5', reps: 8, weight: 85, rpe: 8 },
                            { id: 'lga-6', reps: 8, weight: 85, rpe: 8.5 },
                            { id: 'lga-7', reps: 8, weight: 85, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'zlS0WcB2Vm6f7bQNij1f',
                        exerciseName: 'Sled Leg Press',
                        note: 'Quad volume (8–12 reps).',
                        sets: [
                            { id: 'lga-8', reps: 10, weight: 150, rpe: 8.5 },
                            { id: 'lga-9', reps: 10, weight: 150, rpe: 8.5 },
                            { id: 'lga-10', reps: 10, weight: 150, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: 'Hamstring isolation (8–12 reps).',
                        sets: [
                            { id: 'lga-11', reps: 10, weight: 45, rpe: 8.5 },
                            { id: 'lga-12', reps: 10, weight: 45, rpe: 9 },
                            { id: 'lga-13', reps: 10, weight: 45, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'HMkm6ymh9vFVuCdZJB6d',
                        exerciseName: 'Barbell Calf Raise',
                        note: 'Full stretch at bottom, explosive raise (8–15 reps).',
                        sets: [
                            { id: 'lga-14', reps: 15, weight: 55, rpe: 8.5 },
                            { id: 'lga-15', reps: 15, weight: 55, rpe: 9 },
                            { id: 'lga-16', reps: 15, weight: 55, rpe: 9 },
                            { id: 'lga-17', reps: 15, weight: 55, rpe: 9 },
                        ]
                    }
                ]
            },
            ppl_push_b: {
                name: 'Push B (Volume & Stretch Hypertrophy)',
                notes: 'Focus: Moderate weights, deeper stretch with dumbbells, continuous tension on cables, and 60–90s rest intervals.',
                exercises: [
                    {
                        exerciseId: 'zzYNgHj75NfdLyBQwDaZ',
                        exerciseName: 'Dumbbell Bench Press',
                        note: 'Deeper chest stretch than barbell (8–12 reps).',
                        sets: [
                            { id: 'pplb-1', reps: 10, weight: 30, rpe: 8 },
                            { id: 'pplb-2', reps: 10, weight: 30, rpe: 8.5 },
                            { id: 'pplb-3', reps: 10, weight: 30, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'MtAYb4AVBoAeWFNUxttW',
                        exerciseName: 'Incline Dumbbell Fly',
                        note: 'Upper chest stretch & isolation (10–12 reps).',
                        sets: [
                            { id: 'pplb-4', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'pplb-5', reps: 12, weight: 14, rpe: 9 },
                            { id: 'pplb-6', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'G2PLJr9dtJwlDR3szd7a',
                        exerciseName: 'Dumbbell Shoulder Press',
                        note: 'Seated stable delt press (8–12 reps).',
                        sets: [
                            { id: 'pplb-7', reps: 10, weight: 22, rpe: 8 },
                            { id: 'pplb-8', reps: 10, weight: 22, rpe: 8.5 },
                            { id: 'pplb-9', reps: 10, weight: 22, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'DBqcbgRDrW48atZSwI7g',
                        exerciseName: 'Cable Lateral Raise',
                        note: 'Constant tension across full ROM (12–15 reps).',
                        sets: [
                            { id: 'pplb-10', reps: 15, weight: 7.5, rpe: 8.5 },
                            { id: 'pplb-11', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'pplb-12', reps: 15, weight: 7.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        note: 'Rope pushdown squeezing at lockout (10–15 reps).',
                        sets: [
                            { id: 'pplb-13', reps: 15, weight: 25, rpe: 8.5 },
                            { id: 'pplb-14', reps: 15, weight: 25, rpe: 9 },
                            { id: 'pplb-15', reps: 15, weight: 25, rpe: 9 },
                        ]
                    }
                ]
            },
            ppl_pull_b: {
                name: 'Pull B (Width & Detail Focus)',
                notes: 'Focus: Lat width (Wide Pulldown), lower-back-friendly rows (Chest-Supported/Single-Arm), rear delts, and brachialis.',
                exercises: [
                    {
                        exerciseId: 'GkVcSp5qUfefwwrAGQWx',
                        exerciseName: 'Chest Supported Dumbbell Row',
                        note: 'Removes lower-back fatigue for pure upper-back hypertrophy (8–12 reps).',
                        sets: [
                            { id: 'pllb-1', reps: 10, weight: 32.5, rpe: 8 },
                            { id: 'pllb-2', reps: 10, weight: 32.5, rpe: 8.5 },
                            { id: 'pllb-3', reps: 10, weight: 32.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: 'Wide grip targeting lat width (8–12 reps).',
                        sets: [
                            { id: 'pllb-4', reps: 12, weight: 55, rpe: 8.5 },
                            { id: 'pllb-5', reps: 12, weight: 55, rpe: 8.5 },
                            { id: 'pllb-6', reps: 12, weight: 55, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'MnwbeTJlcY6NvW0YTuy9',
                        exerciseName: 'One Arm Dumbbell Bent Over Row',
                        note: 'Unilateral lat stretch and anti-rotation core work (10–12 reps/arm).',
                        sets: [
                            { id: 'pllb-7', reps: 12, weight: 24, rpe: 8.5 },
                            { id: 'pllb-8', reps: 12, weight: 24, rpe: 9 },
                            { id: 'pllb-9', reps: 12, weight: 24, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'ssJvg2x6J32Je1RChVPL',
                        exerciseName: 'Dumbbell Reverse Fly',
                        note: 'Direct rear-delt isolation for posture & 3D shoulders (12–15 reps).',
                        sets: [
                            { id: 'pllb-10', reps: 15, weight: 10, rpe: 8.5 },
                            { id: 'pllb-11', reps: 15, weight: 10, rpe: 9 },
                            { id: 'pllb-12', reps: 15, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'XdY3WMluqQvjIjLinnjW',
                        exerciseName: 'Hammer Curl',
                        note: 'Targets brachialis & forearms for thicker arms (10–12 reps).',
                        sets: [
                            { id: 'pllb-13', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'pllb-14', reps: 12, weight: 14, rpe: 9 },
                            { id: 'pllb-15', reps: 12, weight: 14, rpe: 9 },
                        ]
                    }
                ]
            },
            ppl_legs_b: {
                name: 'Legs B (Unilateral & Isolation Focus)',
                notes: 'Focus: Single-leg balance and high-rep quad/hamstring isolation without heavy spinal compression.',
                exercises: [
                    {
                        exerciseId: 'dWsWDDAlGluYnHEtp0Pu',
                        exerciseName: 'Bulgarian Split Squat',
                        note: 'Deep quad & glute unilateral builder (8–10 reps/leg).',
                        sets: [
                            { id: 'lgb-1', reps: 10, weight: 16, rpe: 8.5 },
                            { id: 'lgb-2', reps: 10, weight: 16, rpe: 8.5 },
                            { id: 'lgb-3', reps: 10, weight: 16, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'bx80cW4sbNnxQxhkXtV5',
                        exerciseName: 'Leg Extension',
                        note: 'Controlled quad peak contraction (12–15 reps).',
                        sets: [
                            { id: 'lgb-4', reps: 15, weight: 50, rpe: 8.5 },
                            { id: 'lgb-5', reps: 15, weight: 50, rpe: 9 },
                            { id: 'lgb-6', reps: 15, weight: 50, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'rCDlFzCNDyHiCKPRG0c9',
                        exerciseName: 'Walking Lunge',
                        note: 'Dynamic hip/quad conditioning (10–12 steps/leg).',
                        sets: [
                            { id: 'lgb-7', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'lgb-8', reps: 12, weight: 14, rpe: 9 },
                            { id: 'lgb-9', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: 'Controlled 3-second eccentric (10–12 reps).',
                        sets: [
                            { id: 'lgb-10', reps: 12, weight: 42.5, rpe: 8.5 },
                            { id: 'lgb-11', reps: 12, weight: 42.5, rpe: 9 },
                            { id: 'lgb-12', reps: 12, weight: 42.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'cfzkYu8HLFu6gtUWcHbZ',
                        exerciseName: 'Seated Calf Raise',
                        note: 'Soleus hypertrophy (12–15 reps).',
                        sets: [
                            { id: 'lgb-13', reps: 15, weight: 35, rpe: 8.5 },
                            { id: 'lgb-14', reps: 15, weight: 35, rpe: 9 },
                            { id: 'lgb-15', reps: 15, weight: 35, rpe: 9 },
                            { id: 'lgb-16', reps: 15, weight: 35, rpe: 9 },
                        ]
                    }
                ]
            }
        }
    },

    // 5. PHUL (Power Hypertrophy Upper Lower — Brandon Campbell)
    {
        id: 'phul-power-hypertrophy-4day',
        name: 'PHUL (Power Hypertrophy Upper Lower)',
        description:
            'Brandon Campbell’s renowned 4-day Powerbuilding program combining raw strength and muscle hypertrophy. Days 1–2 focus on Power (heavy loads, 3–5 reps), while Days 4–5 focus on Hypertrophy (moderate loads, 8–15 reps). Key Rule: Do not train to absolute failure on every set — stop at ~RPE 9 (1 rep in reserve) and progress via double progression.',
        type: 'repetitive',
        difficulty: 'intermediate',
        goal: 'strength',
        daysPerWeek: 4,
        durationDays: 7,
        author: 'Brandon Campbell',
        days: [
            { id: 'phul-d1', dayNumber: 1, templateKey: 'phul_up', note: 'Day 1 — Upper Power: Heavy compounds (3–5 reps) to drive maximal strength.' },
            { id: 'phul-d2', dayNumber: 2, templateKey: 'phul_lp', note: 'Day 2 — Lower Power: Heavy Squats & Deadlifts (3–5 reps) + Leg Press.' },
            { id: 'phul-d3', dayNumber: 3, templateKey: null, note: 'Rest Day: Allow CNS recovery before high-volume hypertrophy days.' },
            { id: 'phul-d4', dayNumber: 4, templateKey: 'phul_uh', note: 'Day 4 — Upper Hypertrophy: 8–12 rep volume for muscle aesthetics & pump.' },
            { id: 'phul-d5', dayNumber: 5, templateKey: 'phul_lh', note: 'Day 5 — Lower Hypertrophy: High-rep quad/hamstring sweep & calves.' },
            { id: 'phul-d6', dayNumber: 6, templateKey: null, note: 'Rest Day.' },
            { id: 'phul-d7', dayNumber: 7, templateKey: null, note: 'Rest Day.' },
        ],
        templates: {
            phul_up: {
                name: 'Upper Power (PHUL)',
                notes: 'Focus: Heavy upper-body strength. Rest 2–3 min on 3–5 rep compounds, 90s on accessories. Leave 1 clean rep in the tank (RPE 9).',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: '3–4 sets of 3–5 reps. Primary chest strength lift.',
                        sets: [
                            { id: 'phup-1', reps: 5, weight: 80, rpe: 8.5 },
                            { id: 'phup-2', reps: 5, weight: 80, rpe: 8.5 },
                            { id: 'phup-3', reps: 5, weight: 80, rpe: 9 },
                            { id: 'phup-4', reps: 5, weight: 80, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'fX5K9VFoTDjPiLqjYlEB',
                        exerciseName: 'Incline Dumbbell Bench Press',
                        note: '3–4 sets of 6–10 reps.',
                        sets: [
                            { id: 'phup-5', reps: 8, weight: 28, rpe: 8.5 },
                            { id: 'phup-6', reps: 8, weight: 28, rpe: 8.5 },
                            { id: 'phup-7', reps: 8, weight: 28, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: '3–4 sets of 3–5 reps. Heavy upper-back strength.',
                        sets: [
                            { id: 'phup-8', reps: 5, weight: 75, rpe: 8.5 },
                            { id: 'phup-9', reps: 5, weight: 75, rpe: 8.5 },
                            { id: 'phup-10', reps: 5, weight: 75, rpe: 9 },
                            { id: 'phup-11', reps: 5, weight: 75, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: '3–4 sets of 6–10 reps.',
                        sets: [
                            { id: 'phup-12', reps: 8, weight: 60, rpe: 8.5 },
                            { id: 'phup-13', reps: 8, weight: 60, rpe: 8.5 },
                            { id: 'phup-14', reps: 8, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: '2–3 sets of 5–8 reps.',
                        sets: [
                            { id: 'phup-15', reps: 6, weight: 45, rpe: 8.5 },
                            { id: 'phup-16', reps: 6, weight: 45, rpe: 9 },
                            { id: 'phup-17', reps: 6, weight: 45, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'jt4d6gmDQ2WjvrcledxQ',
                        exerciseName: 'Barbell Curl',
                        note: '2–3 sets of 6–10 reps.',
                        sets: [
                            { id: 'phup-18', reps: 8, weight: 32.5, rpe: 8.5 },
                            { id: 'phup-19', reps: 8, weight: 32.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'RosFxsiGEA4nB1IZ4TCg',
                        exerciseName: 'EZ Bar Lying Tricep Extension',
                        note: '2–3 sets of 6–10 reps.',
                        sets: [
                            { id: 'phup-20', reps: 8, weight: 30, rpe: 8.5 },
                            { id: 'phup-21', reps: 8, weight: 30, rpe: 9 },
                        ]
                    }
                ]
            },
            phul_lp: {
                name: 'Lower Power (PHUL)',
                notes: 'Focus: Heavy Squat & Deadlift strength (3–5 reps), followed by higher-rep Leg Press, Leg Curl, and Calves.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: '3–4 sets of 3–5 reps.',
                        sets: [
                            { id: 'phlp-1', reps: 5, weight: 105, rpe: 8.5 },
                            { id: 'phlp-2', reps: 5, weight: 105, rpe: 8.5 },
                            { id: 'phlp-3', reps: 5, weight: 105, rpe: 9 },
                            { id: 'phlp-4', reps: 5, weight: 105, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'W0YdnVZE7hZLaeapNAJm',
                        exerciseName: 'Deadlift',
                        note: '3 sets of 3–5 reps.',
                        sets: [
                            { id: 'phlp-5', reps: 5, weight: 120, rpe: 8.5 },
                            { id: 'phlp-6', reps: 5, weight: 120, rpe: 9 },
                            { id: 'phlp-7', reps: 5, weight: 120, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'zlS0WcB2Vm6f7bQNij1f',
                        exerciseName: 'Sled Leg Press',
                        note: '3–5 sets of 10–15 reps.',
                        sets: [
                            { id: 'phlp-8', reps: 12, weight: 150, rpe: 8.5 },
                            { id: 'phlp-9', reps: 12, weight: 150, rpe: 9 },
                            { id: 'phlp-10', reps: 12, weight: 150, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '3 sets of 6–10 reps.',
                        sets: [
                            { id: 'phlp-11', reps: 8, weight: 50, rpe: 8.5 },
                            { id: 'phlp-12', reps: 8, weight: 50, rpe: 9 },
                            { id: 'phlp-13', reps: 8, weight: 50, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'HMkm6ymh9vFVuCdZJB6d',
                        exerciseName: 'Barbell Calf Raise',
                        note: '4 sets of 6–10 heavy reps.',
                        sets: [
                            { id: 'phlp-14', reps: 10, weight: 65, rpe: 8.5 },
                            { id: 'phlp-15', reps: 10, weight: 65, rpe: 9 },
                            { id: 'phlp-16', reps: 10, weight: 65, rpe: 9 },
                            { id: 'phlp-17', reps: 10, weight: 65, rpe: 9 },
                        ]
                    }
                ]
            },
            phul_uh: {
                name: 'Upper Hypertrophy (PHUL)',
                notes: 'Focus: Moderate weights, 8–12 reps, 60–90s rest intervals to drive metabolic stress and upper-body hypertrophy.',
                exercises: [
                    {
                        exerciseId: 'MWDYdDpBwXPXQObLVoIY',
                        exerciseName: 'Incline Bench Press',
                        note: '3–4 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-1', reps: 10, weight: 55, rpe: 8 },
                            { id: 'phuh-2', reps: 10, weight: 55, rpe: 8.5 },
                            { id: 'phuh-3', reps: 10, weight: 55, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'iEVO9Jby4kOb4Hl4PcvR',
                        exerciseName: 'Dumbbell Fly',
                        note: '3–4 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-4', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'phuh-5', reps: 12, weight: 14, rpe: 9 },
                            { id: 'phuh-6', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '6LqQ85QPHp1bfzh3Z4lk',
                        exerciseName: 'Seated Cable Row',
                        note: '3–4 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-7', reps: 10, weight: 55, rpe: 8.5 },
                            { id: 'phuh-8', reps: 10, weight: 55, rpe: 8.5 },
                            { id: 'phuh-9', reps: 10, weight: 55, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'MnwbeTJlcY6NvW0YTuy9',
                        exerciseName: 'One Arm Dumbbell Bent Over Row',
                        note: '3 sets of 8–12 reps/arm.',
                        sets: [
                            { id: 'phuh-10', reps: 10, weight: 24, rpe: 8.5 },
                            { id: 'phuh-11', reps: 10, weight: 24, rpe: 9 },
                            { id: 'phuh-12', reps: 10, weight: 24, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: '3–4 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-13', reps: 12, weight: 10, rpe: 8.5 },
                            { id: 'phuh-14', reps: 12, weight: 10, rpe: 9 },
                            { id: 'phuh-15', reps: 12, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'B7LuU3lYXyD10saX4Ly4',
                        exerciseName: 'Dumbbell Curl',
                        note: '3 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-16', reps: 12, weight: 12, rpe: 8.5 },
                            { id: 'phuh-17', reps: 12, weight: 12, rpe: 9 },
                            { id: 'phuh-18', reps: 12, weight: 12, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        note: '3 sets of 8–12 reps.',
                        sets: [
                            { id: 'phuh-19', reps: 12, weight: 25, rpe: 8.5 },
                            { id: 'phuh-20', reps: 12, weight: 25, rpe: 9 },
                            { id: 'phuh-21', reps: 12, weight: 25, rpe: 9 },
                        ]
                    }
                ]
            },
            phul_lh: {
                name: 'Lower Hypertrophy (PHUL)',
                notes: 'Focus: High-volume leg development targeting quads, glutes, hamstrings, and calves (8–15 reps).',
                exercises: [
                    {
                        exerciseId: 'bfpmz8DGpWp2SwsVB6DE',
                        exerciseName: 'Front Squat',
                        note: '3–4 sets of 8–12 reps (or Back Squat). Upright torso for quad bias.',
                        sets: [
                            { id: 'phlh-1', reps: 10, weight: 65, rpe: 8 },
                            { id: 'phlh-2', reps: 10, weight: 65, rpe: 8.5 },
                            { id: 'phlh-3', reps: 10, weight: 65, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'dNS7jPLQ6OJiMQMgmn0A',
                        exerciseName: 'Barbell Lunge',
                        note: '3 sets of 8–12 reps/leg.',
                        sets: [
                            { id: 'phlh-4', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'phlh-5', reps: 10, weight: 40, rpe: 9 },
                            { id: 'phlh-6', reps: 10, weight: 40, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'bx80cW4sbNnxQxhkXtV5',
                        exerciseName: 'Leg Extension',
                        note: '3 sets of 10–15 reps.',
                        sets: [
                            { id: 'phlh-7', reps: 15, weight: 50, rpe: 8.5 },
                            { id: 'phlh-8', reps: 15, weight: 50, rpe: 9 },
                            { id: 'phlh-9', reps: 15, weight: 50, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '3 sets of 10–15 reps.',
                        sets: [
                            { id: 'phlh-10', reps: 15, weight: 40, rpe: 8.5 },
                            { id: 'phlh-11', reps: 15, weight: 40, rpe: 9 },
                            { id: 'phlh-12', reps: 15, weight: 40, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'cfzkYu8HLFu6gtUWcHbZ',
                        exerciseName: 'Seated Calf Raise',
                        note: '4 sets of 8–15 reps.',
                        sets: [
                            { id: 'phlh-13', reps: 15, weight: 35, rpe: 8.5 },
                            { id: 'phlh-14', reps: 15, weight: 35, rpe: 9 },
                            { id: 'phlh-15', reps: 15, weight: 35, rpe: 9 },
                            { id: 'phlh-16', reps: 15, weight: 35, rpe: 9 },
                        ]
                    }
                ]
            }
        }
    },

    // 6. Bro-Split (5er-Split)
    {
        id: 'bro-split-5day',
        name: 'Bro-Split (5er-Split)',
        description:
            'Traditional 5-day bodybuilding split dedicating each session to a single muscle group: Chest, Back, Shoulders, Legs, and Arms. Maximizes per-session volume, mind-muscle connection, and blood flow ("pump") while giving each muscle 7 full days to recover.',
        type: 'repetitive',
        difficulty: 'intermediate',
        goal: 'hypertrophy',
        daysPerWeek: 5,
        durationDays: 7,
        author: 'Sport Amigo Team',
        days: [
            { id: 'bro-d1', dayNumber: 1, templateKey: 'bro_chest', note: 'Day 1 — Chest: Heavy presses, upper-chest incline & deep-stretch flyes.' },
            { id: 'bro-d2', dayNumber: 2, templateKey: 'bro_back', note: 'Day 2 — Back: Width (vertical pulls) & thickness (rows).' },
            { id: 'bro-d3', dayNumber: 3, templateKey: 'bro_shoulders', note: 'Day 3 — Shoulders: All 3 delt heads (front, side, rear) + traps.' },
            { id: 'bro-d4', dayNumber: 4, templateKey: 'bro_legs', note: 'Day 4 — Legs: Quads, hamstrings, glutes & calves.' },
            { id: 'bro-d5', dayNumber: 5, templateKey: 'bro_arms', note: 'Day 5 — Arms: High-volume Biceps & Triceps supersets.' },
            { id: 'bro-d6', dayNumber: 6, templateKey: null, note: 'Weekend Rest & Recovery.' },
            { id: 'bro-d7', dayNumber: 7, templateKey: null, note: 'Weekend Rest & Recovery.' },
        ],
        templates: {
            bro_chest: {
                name: 'Bro-Split: Chest Day',
                notes: 'Focus: 1–2 RIR on heavy presses, push isolation flyes/push-ups to near failure (RPE 9–9.5) for maximum hypertrophy.',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: '4 sets of 6–8 reps.',
                        sets: [
                            { id: 'brc-1', reps: 8, weight: 75, rpe: 8 },
                            { id: 'brc-2', reps: 8, weight: 75, rpe: 8.5 },
                            { id: 'brc-3', reps: 8, weight: 75, rpe: 8.5 },
                            { id: 'brc-4', reps: 6, weight: 77.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'fX5K9VFoTDjPiLqjYlEB',
                        exerciseName: 'Incline Dumbbell Bench Press',
                        note: '3 sets of 8–10 reps for upper chest.',
                        sets: [
                            { id: 'brc-5', reps: 10, weight: 26, rpe: 8.5 },
                            { id: 'brc-6', reps: 10, weight: 26, rpe: 8.5 },
                            { id: 'brc-7', reps: 10, weight: 26, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'hoo6eeuTvfv8BLb8VOGs',
                        exerciseName: 'Dips',
                        note: 'Chest-leaning dips (3 sets of 10–12 reps) for lower pecs.',
                        sets: [
                            { id: 'brc-8', reps: 12, rpe: 8.5 },
                            { id: 'brc-9', reps: 12, rpe: 9 },
                            { id: 'brc-10', reps: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'Xj3WpD5IZcMN2cepOsk6',
                        exerciseName: 'Cable Fly',
                        note: 'Constant-tension chest flyes (3 sets of 12–15 reps).',
                        sets: [
                            { id: 'brc-11', reps: 15, weight: 15, rpe: 8.5 },
                            { id: 'brc-12', reps: 15, weight: 15, rpe: 9 },
                            { id: 'brc-13', reps: 15, weight: 15, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'mNXHzaLY7bOMuN8ZkMJB',
                        exerciseName: 'Push Ups',
                        note: 'Finisher sets close to failure.',
                        sets: [
                            { id: 'brc-14', reps: 15, rpe: 9.5 },
                            { id: 'brc-15', reps: 12, rpe: 10 },
                        ]
                    }
                ]
            },
            bro_back: {
                name: 'Bro-Split: Back Day',
                notes: 'Focus: Vertical pulling for V-taper width and horizontal rowing for mid-back density.',
                exercises: [
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        note: 'Heavy compound back builder (3 sets of 5–8 reps).',
                        sets: [
                            { id: 'brb-1', reps: 8, weight: 70, rpe: 8 },
                            { id: 'brb-2', reps: 8, weight: 70, rpe: 8.5 },
                            { id: 'brb-3', reps: 8, weight: 70, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: 'Wide grip (3 sets of 8–10 reps).',
                        sets: [
                            { id: 'brb-4', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'brb-5', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'brb-6', reps: 10, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '6LqQ85QPHp1bfzh3Z4lk',
                        exerciseName: 'Seated Cable Row',
                        note: 'Close-grip squeeze (3 sets of 10–12 reps).',
                        sets: [
                            { id: 'brb-7', reps: 12, weight: 55, rpe: 8.5 },
                            { id: 'brb-8', reps: 12, weight: 55, rpe: 9 },
                            { id: 'brb-9', reps: 12, weight: 55, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'MnwbeTJlcY6NvW0YTuy9',
                        exerciseName: 'One Arm Dumbbell Bent Over Row',
                        note: 'Full lat stretch at bottom (3 sets of 10–12 reps).',
                        sets: [
                            { id: 'brb-10', reps: 12, weight: 24, rpe: 8.5 },
                            { id: 'brb-11', reps: 12, weight: 24, rpe: 9 },
                            { id: 'brb-12', reps: 12, weight: 24, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '8PXbYLKhoBthpi1kabPl',
                        exerciseName: 'Straight Arm Pulldown',
                        note: 'Lat isolation finisher (3 sets of 12–15 reps).',
                        sets: [
                            { id: 'brb-13', reps: 15, weight: 22.5, rpe: 8.5 },
                            { id: 'brb-14', reps: 15, weight: 22.5, rpe: 9 },
                            { id: 'brb-15', reps: 15, weight: 22.5, rpe: 9.5 },
                        ]
                    }
                ]
            },
            bro_shoulders: {
                name: 'Bro-Split: Shoulders Day',
                notes: 'Focus: 3D shoulder development hitting anterior, lateral, and posterior deltoids plus upper traps.',
                exercises: [
                    {
                        exerciseId: 'G2PLJr9dtJwlDR3szd7a',
                        exerciseName: 'Dumbbell Shoulder Press',
                        note: 'Seated heavy press (4 sets of 6–8 reps).',
                        sets: [
                            { id: 'brs-1', reps: 8, weight: 24, rpe: 8 },
                            { id: 'brs-2', reps: 8, weight: 24, rpe: 8.5 },
                            { id: 'brs-3', reps: 8, weight: 24, rpe: 8.5 },
                            { id: 'brs-4', reps: 8, weight: 24, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: '4 sets of 12–15 reps.',
                        sets: [
                            { id: 'brs-5', reps: 15, weight: 10, rpe: 8.5 },
                            { id: 'brs-6', reps: 15, weight: 10, rpe: 9 },
                            { id: 'brs-7', reps: 15, weight: 10, rpe: 9 },
                            { id: 'brs-8', reps: 15, weight: 10, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'DBqcbgRDrW48atZSwI7g',
                        exerciseName: 'Cable Lateral Raise',
                        note: 'Constant tension side-delt finisher (3 sets of 12–15 reps).',
                        sets: [
                            { id: 'brs-9', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'brs-10', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'brs-11', reps: 15, weight: 7.5, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'ssJvg2x6J32Je1RChVPL',
                        exerciseName: 'Dumbbell Reverse Fly',
                        note: '4 sets of 12–15 reps for rear delts.',
                        sets: [
                            { id: 'brs-12', reps: 15, weight: 10, rpe: 8.5 },
                            { id: 'brs-13', reps: 15, weight: 10, rpe: 9 },
                            { id: 'brs-14', reps: 15, weight: 10, rpe: 9 },
                            { id: 'brs-15', reps: 15, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'XC7O8oNAX0jhpdcXvMBi',
                        exerciseName: 'Dumbbell Shrug',
                        note: 'Upper traps (3 sets of 10–12 reps), pause 1s at top.',
                        sets: [
                            { id: 'brs-16', reps: 12, weight: 28, rpe: 8.5 },
                            { id: 'brs-17', reps: 12, weight: 28, rpe: 9 },
                            { id: 'brs-18', reps: 12, weight: 28, rpe: 9 },
                        ]
                    }
                ]
            },
            bro_legs: {
                name: 'Bro-Split: Legs Day',
                notes: 'Focus: Complete lower-body session covering squats, hip hinges, unilateral quads, hamstring isolation, and calves.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: '4 sets of 6–8 reps.',
                        sets: [
                            { id: 'brl-1', reps: 8, weight: 95, rpe: 8 },
                            { id: 'brl-2', reps: 8, weight: 95, rpe: 8.5 },
                            { id: 'brl-3', reps: 8, weight: 95, rpe: 8.5 },
                            { id: 'brl-4', reps: 8, weight: 95, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'u4J5KLxDobxD5pFJPW1i',
                        exerciseName: 'Romanian Deadlift',
                        note: '3 sets of 8–10 reps.',
                        sets: [
                            { id: 'brl-5', reps: 10, weight: 80, rpe: 8 },
                            { id: 'brl-6', reps: 10, weight: 80, rpe: 8.5 },
                            { id: 'brl-7', reps: 10, weight: 80, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'dWsWDDAlGluYnHEtp0Pu',
                        exerciseName: 'Bulgarian Split Squat',
                        note: '3 sets of 10–12 reps/leg.',
                        sets: [
                            { id: 'brl-8', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'brl-9', reps: 12, weight: 14, rpe: 9 },
                            { id: 'brl-10', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'brl-11', reps: 15, weight: 40, rpe: 8.5 },
                            { id: 'brl-12', reps: 15, weight: 40, rpe: 9 },
                            { id: 'brl-13', reps: 15, weight: 40, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'HMkm6ymh9vFVuCdZJB6d',
                        exerciseName: 'Barbell Calf Raise',
                        note: '4 sets of 15–20 reps.',
                        sets: [
                            { id: 'brl-14', reps: 20, weight: 50, rpe: 8.5 },
                            { id: 'brl-15', reps: 20, weight: 50, rpe: 9 },
                            { id: 'brl-16', reps: 20, weight: 50, rpe: 9 },
                            { id: 'brl-17', reps: 20, weight: 50, rpe: 9.5 },
                        ]
                    }
                ]
            },
            bro_arms: {
                name: 'Bro-Split: Arms Day (Biceps & Triceps)',
                notes: 'Focus: Antagonistic supersets pairing Biceps and Triceps to maximize blood flow, stretch, and pump.',
                exercises: [
                    {
                        exerciseId: 'jt4d6gmDQ2WjvrcledxQ',
                        exerciseName: 'Barbell Curl',
                        supersetId: 'bro_ss1',
                        supersetNote: 'Heavy Arm Superset 1',
                        sets: [
                            { id: 'bra-1', reps: 10, weight: 32.5, rpe: 8.5 },
                            { id: 'bra-2', reps: 10, weight: 32.5, rpe: 8.5 },
                            { id: 'bra-3', reps: 10, weight: 32.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '813mOmBKNITbWd7d6WIq',
                        exerciseName: 'Close Grip Bench Press',
                        supersetId: 'bro_ss1',
                        supersetNote: 'Heavy Arm Superset 1',
                        sets: [
                            { id: 'bra-4', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'bra-5', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'bra-6', reps: 10, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'rqCJDJTomy2WPUb3XY3k',
                        exerciseName: 'Incline Dumbbell Curl',
                        supersetId: 'bro_ss2',
                        supersetNote: 'Long-Head Stretch Superset 2',
                        sets: [
                            { id: 'bra-7', reps: 12, weight: 12, rpe: 8.5 },
                            { id: 'bra-8', reps: 12, weight: 12, rpe: 9 },
                            { id: 'bra-9', reps: 12, weight: 12, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'AefeyCyJzP7BP7OHbxOW',
                        exerciseName: 'Cable Overhead Tricep Extension',
                        supersetId: 'bro_ss2',
                        supersetNote: 'Long-Head Stretch Superset 2',
                        sets: [
                            { id: 'bra-10', reps: 12, weight: 22.5, rpe: 8.5 },
                            { id: 'bra-11', reps: 12, weight: 22.5, rpe: 9 },
                            { id: 'bra-12', reps: 12, weight: 22.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'XdY3WMluqQvjIjLinnjW',
                        exerciseName: 'Hammer Curl',
                        supersetId: 'bro_ss3',
                        supersetNote: 'Pump Finisher Superset 3',
                        sets: [
                            { id: 'bra-13', reps: 15, weight: 12, rpe: 9 },
                            { id: 'bra-14', reps: 15, weight: 12, rpe: 9 },
                            { id: 'bra-15', reps: 15, weight: 12, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        supersetId: 'bro_ss3',
                        supersetNote: 'Pump Finisher Superset 3',
                        sets: [
                            { id: 'bra-16', reps: 15, weight: 25, rpe: 9 },
                            { id: 'bra-17', reps: 15, weight: 25, rpe: 9 },
                            { id: 'bra-18', reps: 15, weight: 25, rpe: 9.5 },
                        ]
                    }
                ]
            }
        }
    },

    // 7. Arnold Split (6-Day Antagonistic A/B Split)
    {
        id: 'arnold-split-6day',
        name: 'Arnold Split (6-Day Antagonistic)',
        description:
            'Popularized by Arnold Schwarzenegger, this high-volume 6-day routine trains every muscle group 2x/week by pairing antagonistic muscles: Chest + Back, Shoulders + Arms, and Legs + Core. Features Heavy A days (Days 1–3) and Volume B days (Days 4–6) with optional antagonistic supersets for an unmatched pump. Best for intermediate/advanced lifters with solid sleep and nutrition.',
        type: 'repetitive',
        difficulty: 'advanced',
        goal: 'hypertrophy',
        daysPerWeek: 6,
        durationDays: 7,
        author: 'Arnold Classic',
        days: [
            { id: 'arn-d1', dayNumber: 1, templateKey: 'arn_cb_a', note: 'Day 1 — Chest & Back A (Heavy): Compound strength + antagonistic supersets.' },
            { id: 'arn-d2', dayNumber: 2, templateKey: 'arn_sa_a', note: 'Day 2 — Shoulders & Arms A (Heavy): OHP, Barbell Curl & Close-Grip Bench.' },
            { id: 'arn-d3', dayNumber: 3, templateKey: 'arn_lg_a', note: 'Day 3 — Legs & Core A (Heavy Quads): Back Squats, RDLs & Leg Press.' },
            { id: 'arn-d4', dayNumber: 4, templateKey: 'arn_cb_b', note: 'Day 4 — Chest & Back B (Volume): Incline, rows & cable flyes.' },
            { id: 'arn-d5', dayNumber: 5, templateKey: 'arn_sa_b', note: 'Day 5 — Shoulders & Arms B (Volume): Arnold Press, cable raises & isolation.' },
            { id: 'arn-d6', dayNumber: 6, templateKey: 'arn_lg_b', note: 'Day 6 — Legs & Core B (Hamstrings/Unilateral): Front Squats, Leg Curls & Split Squats.' },
            { id: 'arn-d7', dayNumber: 7, templateKey: null, note: 'Day 7 — Rest & Recovery: Essential before repeating the 6-day cycle.' },
        ],
        templates: {
            arn_cb_a: {
                name: 'Arnold: Chest & Back A (Heavy)',
                notes: 'Focus: Heavy antagonistic pairings. Bench Press and Pull-ups/Rows can be supersetted with 90–120s rest between exercises.',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        supersetId: 'arn_cba_ss1',
                        supersetNote: 'Antagonistic Chest/Back Compound Superset',
                        sets: [
                            { id: 'acba-1', reps: 8, weight: 80, rpe: 8 },
                            { id: 'acba-2', reps: 8, weight: 80, rpe: 8.5 },
                            { id: 'acba-3', reps: 6, weight: 82.5, rpe: 8.5 },
                            { id: 'acba-4', reps: 6, weight: 82.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '2oEkViofmMxIUFoURTV1',
                        exerciseName: 'Pull Ups',
                        supersetId: 'arn_cba_ss1',
                        supersetNote: 'Antagonistic Chest/Back Compound Superset',
                        sets: [
                            { id: 'acba-5', reps: 8, rpe: 8 },
                            { id: 'acba-6', reps: 8, rpe: 8.5 },
                            { id: 'acba-7', reps: 8, rpe: 8.5 },
                            { id: 'acba-8', reps: 7, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'fX5K9VFoTDjPiLqjYlEB',
                        exerciseName: 'Incline Dumbbell Bench Press',
                        supersetId: 'arn_cba_ss2',
                        supersetNote: 'Upper Chest & Mid-Back Superset',
                        sets: [
                            { id: 'acba-9', reps: 10, weight: 28, rpe: 8.5 },
                            { id: 'acba-10', reps: 10, weight: 28, rpe: 8.5 },
                            { id: 'acba-11', reps: 10, weight: 28, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'sLIb91vzNYFTkX0dkcIz',
                        exerciseName: 'Bent Over Row',
                        supersetId: 'arn_cba_ss2',
                        supersetNote: 'Upper Chest & Mid-Back Superset',
                        sets: [
                            { id: 'acba-12', reps: 10, weight: 65, rpe: 8.5 },
                            { id: 'acba-13', reps: 10, weight: 65, rpe: 8.5 },
                            { id: 'acba-14', reps: 10, weight: 65, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'iEVO9Jby4kOb4Hl4PcvR',
                        exerciseName: 'Dumbbell Fly',
                        note: 'Deep pec stretch (3 sets of 12–15 reps).',
                        sets: [
                            { id: 'acba-15', reps: 15, weight: 14, rpe: 8.5 },
                            { id: 'acba-16', reps: 15, weight: 14, rpe: 9 },
                            { id: 'acba-17', reps: 15, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '8PXbYLKhoBthpi1kabPl',
                        exerciseName: 'Straight Arm Pulldown',
                        note: 'Lat isolation finisher (3 sets of 12–15 reps).',
                        sets: [
                            { id: 'acba-18', reps: 15, weight: 22.5, rpe: 8.5 },
                            { id: 'acba-19', reps: 15, weight: 22.5, rpe: 9 },
                            { id: 'acba-20', reps: 15, weight: 22.5, rpe: 9 },
                        ]
                    }
                ]
            },
            arn_sa_a: {
                name: 'Arnold: Shoulders & Arms A (Heavy)',
                notes: 'Focus: Heavy shoulder pressing followed by antagonistic Biceps/Triceps supersets.',
                exercises: [
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: '4 sets of 6–8 reps.',
                        sets: [
                            { id: 'asaa-1', reps: 8, weight: 45, rpe: 8 },
                            { id: 'asaa-2', reps: 8, weight: 45, rpe: 8.5 },
                            { id: 'asaa-3', reps: 8, weight: 45, rpe: 8.5 },
                            { id: 'asaa-4', reps: 6, weight: 47.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'Y92Mjk9g0WpQN6fmdz5s',
                        exerciseName: 'Dumbbell Lateral Raise',
                        note: '4 sets of 10–12 reps.',
                        sets: [
                            { id: 'asaa-5', reps: 12, weight: 10, rpe: 8.5 },
                            { id: 'asaa-6', reps: 12, weight: 10, rpe: 9 },
                            { id: 'asaa-7', reps: 12, weight: 10, rpe: 9 },
                            { id: 'asaa-8', reps: 12, weight: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'jt4d6gmDQ2WjvrcledxQ',
                        exerciseName: 'Barbell Curl',
                        supersetId: 'arn_saa_ss1',
                        supersetNote: 'Heavy Arm Superset',
                        sets: [
                            { id: 'asaa-9', reps: 10, weight: 32.5, rpe: 8.5 },
                            { id: 'asaa-10', reps: 10, weight: 32.5, rpe: 9 },
                            { id: 'asaa-11', reps: 10, weight: 32.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '813mOmBKNITbWd7d6WIq',
                        exerciseName: 'Close Grip Bench Press',
                        supersetId: 'arn_saa_ss1',
                        supersetNote: 'Heavy Arm Superset',
                        sets: [
                            { id: 'asaa-12', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'asaa-13', reps: 10, weight: 60, rpe: 9 },
                            { id: 'asaa-14', reps: 10, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'rqCJDJTomy2WPUb3XY3k',
                        exerciseName: 'Incline Dumbbell Curl',
                        supersetId: 'arn_saa_ss2',
                        supersetNote: 'Arm Stretch Superset',
                        sets: [
                            { id: 'asaa-15', reps: 12, weight: 12, rpe: 8.5 },
                            { id: 'asaa-16', reps: 12, weight: 12, rpe: 9 },
                            { id: 'asaa-17', reps: 12, weight: 12, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'RosFxsiGEA4nB1IZ4TCg',
                        exerciseName: 'EZ Bar Lying Tricep Extension',
                        supersetId: 'arn_saa_ss2',
                        supersetNote: 'Arm Stretch Superset',
                        sets: [
                            { id: 'asaa-18', reps: 10, weight: 30, rpe: 8.5 },
                            { id: 'asaa-19', reps: 10, weight: 30, rpe: 9 },
                            { id: 'asaa-20', reps: 10, weight: 30, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'ssJvg2x6J32Je1RChVPL',
                        exerciseName: 'Dumbbell Reverse Fly',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'asaa-21', reps: 15, weight: 10, rpe: 8.5 },
                            { id: 'asaa-22', reps: 15, weight: 10, rpe: 9 },
                            { id: 'asaa-23', reps: 15, weight: 10, rpe: 9 },
                        ]
                    }
                ]
            },
            arn_lg_a: {
                name: 'Arnold: Legs & Core A (Heavy Quads)',
                notes: 'Focus: Quad-dominant lower-body strength with RDLs, Calves, and Hanging Leg Raises.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: '4 sets of 6–8 reps.',
                        sets: [
                            { id: 'alga-1', reps: 8, weight: 100, rpe: 8 },
                            { id: 'alga-2', reps: 8, weight: 100, rpe: 8.5 },
                            { id: 'alga-3', reps: 8, weight: 100, rpe: 8.5 },
                            { id: 'alga-4', reps: 8, weight: 100, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'u4J5KLxDobxD5pFJPW1i',
                        exerciseName: 'Romanian Deadlift',
                        note: '3 sets of 8–10 reps.',
                        sets: [
                            { id: 'alga-5', reps: 10, weight: 85, rpe: 8 },
                            { id: 'alga-6', reps: 10, weight: 85, rpe: 8.5 },
                            { id: 'alga-7', reps: 10, weight: 85, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'zlS0WcB2Vm6f7bQNij1f',
                        exerciseName: 'Sled Leg Press',
                        note: '3 sets of 10–12 reps.',
                        sets: [
                            { id: 'alga-8', reps: 12, weight: 150, rpe: 8.5 },
                            { id: 'alga-9', reps: 12, weight: 150, rpe: 9 },
                            { id: 'alga-10', reps: 12, weight: 150, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'alga-11', reps: 15, weight: 42.5, rpe: 8.5 },
                            { id: 'alga-12', reps: 15, weight: 42.5, rpe: 9 },
                            { id: 'alga-13', reps: 15, weight: 42.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'HMkm6ymh9vFVuCdZJB6d',
                        exerciseName: 'Barbell Calf Raise',
                        note: '4 sets of 15–20 reps.',
                        sets: [
                            { id: 'alga-14', reps: 20, weight: 55, rpe: 8.5 },
                            { id: 'alga-15', reps: 20, weight: 55, rpe: 9 },
                            { id: 'alga-16', reps: 20, weight: 55, rpe: 9 },
                            { id: 'alga-17', reps: 20, weight: 55, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'AKU96E3Mav0ix07oYEnS',
                        exerciseName: 'Hanging Leg Raise',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'alga-18', reps: 15, rpe: 8.5 },
                            { id: 'alga-19', reps: 15, rpe: 9 },
                            { id: 'alga-20', reps: 15, rpe: 9 },
                        ]
                    }
                ]
            },
            arn_cb_b: {
                name: 'Arnold: Chest & Back B (Volume)',
                notes: 'Focus: Moderate weights (8–15 reps), incline/flat dumbbell presses, cable flyes, and chest-supported rowing.',
                exercises: [
                    {
                        exerciseId: 'MWDYdDpBwXPXQObLVoIY',
                        exerciseName: 'Incline Bench Press',
                        note: '4 sets of 8–10 reps.',
                        sets: [
                            { id: 'acbb-1', reps: 10, weight: 60, rpe: 8 },
                            { id: 'acbb-2', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'acbb-3', reps: 10, weight: 60, rpe: 9 },
                            { id: 'acbb-4', reps: 10, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '6LqQ85QPHp1bfzh3Z4lk',
                        exerciseName: 'Seated Cable Row',
                        note: '4 sets of 8–10 reps.',
                        sets: [
                            { id: 'acbb-5', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'acbb-6', reps: 10, weight: 60, rpe: 8.5 },
                            { id: 'acbb-7', reps: 10, weight: 60, rpe: 9 },
                            { id: 'acbb-8', reps: 10, weight: 60, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'zzYNgHj75NfdLyBQwDaZ',
                        exerciseName: 'Dumbbell Bench Press',
                        note: '3 sets of 10–12 reps.',
                        sets: [
                            { id: 'acbb-9', reps: 12, weight: 28, rpe: 8.5 },
                            { id: 'acbb-10', reps: 12, weight: 28, rpe: 9 },
                            { id: 'acbb-11', reps: 12, weight: 28, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'CtCAguF1ABtf2UUNvK3k',
                        exerciseName: 'Lat Pulldown',
                        note: 'Close-grip lat pulldown (3 sets of 10–12 reps).',
                        sets: [
                            { id: 'acbb-12', reps: 12, weight: 55, rpe: 8.5 },
                            { id: 'acbb-13', reps: 12, weight: 55, rpe: 9 },
                            { id: 'acbb-14', reps: 12, weight: 55, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'Xj3WpD5IZcMN2cepOsk6',
                        exerciseName: 'Cable Fly',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'acbb-15', reps: 15, weight: 15, rpe: 9 },
                            { id: 'acbb-16', reps: 15, weight: 15, rpe: 9 },
                            { id: 'acbb-17', reps: 15, weight: 15, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'GkVcSp5qUfefwwrAGQWx',
                        exerciseName: 'Chest Supported Dumbbell Row',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'acbb-18', reps: 15, weight: 30, rpe: 8.5 },
                            { id: 'acbb-19', reps: 15, weight: 30, rpe: 9 },
                            { id: 'acbb-20', reps: 15, weight: 30, rpe: 9 },
                        ]
                    }
                ]
            },
            arn_sa_b: {
                name: 'Arnold: Shoulders & Arms B (Volume)',
                notes: 'Focus: Classic Arnold Press, constant-tension cable lateral raises, and high-rep arm supersets.',
                exercises: [
                    {
                        exerciseId: 'vpCIlOUKVyeQSX0JWkot',
                        exerciseName: 'Arnold Press',
                        note: '4 sets of 8–10 reps. Rotate palms smoothly through the press.',
                        sets: [
                            { id: 'asab-1', reps: 10, weight: 18, rpe: 8 },
                            { id: 'asab-2', reps: 10, weight: 18, rpe: 8.5 },
                            { id: 'asab-3', reps: 10, weight: 18, rpe: 9 },
                            { id: 'asab-4', reps: 10, weight: 18, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'DBqcbgRDrW48atZSwI7g',
                        exerciseName: 'Cable Lateral Raise',
                        note: '4 sets of 12–15 reps.',
                        sets: [
                            { id: 'asab-5', reps: 15, weight: 7.5, rpe: 8.5 },
                            { id: 'asab-6', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'asab-7', reps: 15, weight: 7.5, rpe: 9 },
                            { id: 'asab-8', reps: 15, weight: 7.5, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'XdY3WMluqQvjIjLinnjW',
                        exerciseName: 'Hammer Curl',
                        supersetId: 'arn_sab_ss1',
                        supersetNote: 'Volume Arm Superset 1',
                        sets: [
                            { id: 'asab-9', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'asab-10', reps: 12, weight: 14, rpe: 9 },
                            { id: 'asab-11', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'AefeyCyJzP7BP7OHbxOW',
                        exerciseName: 'Cable Overhead Tricep Extension',
                        supersetId: 'arn_sab_ss1',
                        supersetNote: 'Volume Arm Superset 1',
                        sets: [
                            { id: 'asab-12', reps: 12, weight: 22.5, rpe: 8.5 },
                            { id: 'asab-13', reps: 12, weight: 22.5, rpe: 9 },
                            { id: 'asab-14', reps: 12, weight: 22.5, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: '590OIHb4R2YsWXXBVBYn',
                        exerciseName: 'Preacher Curl',
                        supersetId: 'arn_sab_ss2',
                        supersetNote: 'Volume Arm Superset 2',
                        sets: [
                            { id: 'asab-15', reps: 12, weight: 25, rpe: 8.5 },
                            { id: 'asab-16', reps: 12, weight: 25, rpe: 9 },
                            { id: 'asab-17', reps: 12, weight: 25, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        supersetId: 'arn_sab_ss2',
                        supersetNote: 'Volume Arm Superset 2',
                        sets: [
                            { id: 'asab-18', reps: 15, weight: 25, rpe: 9 },
                            { id: 'asab-19', reps: 15, weight: 25, rpe: 9 },
                            { id: 'asab-20', reps: 15, weight: 25, rpe: 9.5 },
                        ]
                    }
                ]
            },
            arn_lg_b: {
                name: 'Arnold: Legs & Core B (Hamstrings & Unilateral)',
                notes: 'Focus: Front Squats + heavy hamstring work + Bulgarian Split Squats + Seated Calf Raises.',
                exercises: [
                    {
                        exerciseId: 'bfpmz8DGpWp2SwsVB6DE',
                        exerciseName: 'Front Squat',
                        note: '4 sets of 8–10 reps.',
                        sets: [
                            { id: 'algb-1', reps: 10, weight: 70, rpe: 8 },
                            { id: 'algb-2', reps: 10, weight: 70, rpe: 8.5 },
                            { id: 'algb-3', reps: 10, weight: 70, rpe: 9 },
                            { id: 'algb-4', reps: 10, weight: 70, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '4 sets of 10–12 reps.',
                        sets: [
                            { id: 'algb-5', reps: 12, weight: 45, rpe: 8.5 },
                            { id: 'algb-6', reps: 12, weight: 45, rpe: 9 },
                            { id: 'algb-7', reps: 12, weight: 45, rpe: 9 },
                            { id: 'algb-8', reps: 12, weight: 45, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'dWsWDDAlGluYnHEtp0Pu',
                        exerciseName: 'Bulgarian Split Squat',
                        note: '3 sets of 10–12 reps/leg.',
                        sets: [
                            { id: 'algb-9', reps: 12, weight: 14, rpe: 8.5 },
                            { id: 'algb-10', reps: 12, weight: 14, rpe: 9 },
                            { id: 'algb-11', reps: 12, weight: 14, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'bx80cW4sbNnxQxhkXtV5',
                        exerciseName: 'Leg Extension',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'algb-12', reps: 15, weight: 50, rpe: 9 },
                            { id: 'algb-13', reps: 15, weight: 50, rpe: 9 },
                            { id: 'algb-14', reps: 15, weight: 50, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'cfzkYu8HLFu6gtUWcHbZ',
                        exerciseName: 'Seated Calf Raise',
                        note: '4 sets of 15–20 reps.',
                        sets: [
                            { id: 'algb-15', reps: 20, weight: 35, rpe: 8.5 },
                            { id: 'algb-16', reps: 20, weight: 35, rpe: 9 },
                            { id: 'algb-17', reps: 20, weight: 35, rpe: 9 },
                            { id: 'algb-18', reps: 20, weight: 35, rpe: 9.5 },
                        ]
                    },
                    {
                        exerciseId: 'jblEAJWGAr0cGrBCHPXu',
                        exerciseName: 'Plank',
                        note: '3 sets of 60s weighted holds.',
                        sets: [
                            { id: 'algb-19', reps: 60, rpe: 8 },
                            { id: 'algb-20', reps: 60, rpe: 8.5 },
                            { id: 'algb-21', reps: 60, rpe: 9 },
                        ]
                    }
                ]
            }
        }
    },

    // 8. 5/3/1 Boring But Big (Jim Wendler) — 2-Week Wave (5s Week + 3s Week)
    {
        id: 'wendler-531-boring-but-big',
        name: '5/3/1 Boring But Big (Jim Wendler)',
        description:
            'Jim Wendler’s legendary 4-day strength & hypertrophy system. Base all percentages on a Training Max (TM = 90% of true 1RM). This 2-week (14-day) cycle models Week 1 ("5s Week": 65%/75%/85%x5+) and Week 2 ("3s Week": 70%/80%/90%x3+), followed by 5x10 BBB supplemental sets at 50% TM and minimal accessories. After completing a full 4-week wave (Week 3: 5/3/1 + Week 4: Deload), add +2.5 kg to Bench/OHP TM and +5 kg to Squat/Deadlift TM.',
        type: 'repetitive',
        difficulty: 'intermediate',
        goal: 'strength',
        daysPerWeek: 4,
        durationDays: 14,
        author: 'Jim Wendler',
        days: [
            { id: 'w531-d1', dayNumber: 1, templateKey: 'w531_ohp_5s', note: 'Week 1 (5s Week) — Overhead Press: 65%/75%/85% (5+) + 5x10 BBB.' },
            { id: 'w531-d2', dayNumber: 2, templateKey: 'w531_dl_5s', note: 'Week 1 (5s Week) — Deadlift: 65%/75%/85% (5+) + 5x10 BBB.' },
            { id: 'w531-d3', dayNumber: 3, templateKey: null, note: 'Rest / Active Recovery.' },
            { id: 'w531-d4', dayNumber: 4, templateKey: 'w531_bp_5s', note: 'Week 1 (5s Week) — Bench Press: 65%/75%/85% (5+) + 5x10 BBB.' },
            { id: 'w531-d5', dayNumber: 5, templateKey: 'w531_sq_5s', note: 'Week 1 (5s Week) — Squat: 65%/75%/85% (5+) + 5x10 BBB.' },
            { id: 'w531-d6', dayNumber: 6, templateKey: null, note: 'Weekend Rest.' },
            { id: 'w531-d7', dayNumber: 7, templateKey: null, note: 'Weekend Rest.' },
            { id: 'w531-d8', dayNumber: 8, templateKey: 'w531_ohp_3s', note: 'Week 2 (3s Week) — Overhead Press: 70%/80%/90% (3+) + 5x10 BBB.' },
            { id: 'w531-d9', dayNumber: 9, templateKey: 'w531_dl_3s', note: 'Week 2 (3s Week) — Deadlift: 70%/80%/90% (3+) + 5x10 BBB.' },
            { id: 'w531-d10', dayNumber: 10, templateKey: null, note: 'Rest / Active Recovery.' },
            { id: 'w531-d11', dayNumber: 11, templateKey: 'w531_bp_3s', note: 'Week 2 (3s Week) — Bench Press: 70%/80%/90% (3+) + 5x10 BBB.' },
            { id: 'w531-d12', dayNumber: 12, templateKey: 'w531_sq_3s', note: 'Week 2 (3s Week) — Squat: 70%/80%/90% (3+) + 5x10 BBB.' },
            { id: 'w531-d13', dayNumber: 13, templateKey: null, note: 'Weekend Rest.' },
            { id: 'w531-d14', dayNumber: 14, templateKey: null, note: 'Rest. Ready for Week 3 (75/85/95% 1+) or repeat cycle.' },
        ],
        templates: {
            w531_ohp_5s: {
                name: '5/3/1 OHP (Week 1: 5s + BBB)',
                notes: 'Main Sets: 65% x 5, 75% x 5, 85% x 5+ (AMRAP — stop 1–2 reps shy of failure). Supplemental BBB: 5x10 @ 50% TM. Keep accessories minimal to recover from 5x10.',
                exercises: [
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: 'Sets 1–3: 65%, 75%, 85% AMRAP (5+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wo5-1', reps: 5, weight: 32.5, rpe: 6.5 },
                            { id: 'wo5-2', reps: 5, weight: 37.5, rpe: 7.5 },
                            { id: 'wo5-3', reps: 7, weight: 42.5, rpe: 9 },
                            { id: 'wo5-4', reps: 10, weight: 25, rpe: 7 },
                            { id: 'wo5-5', reps: 10, weight: 25, rpe: 7.5 },
                            { id: 'wo5-6', reps: 10, weight: 25, rpe: 8 },
                            { id: 'wo5-7', reps: 10, weight: 25, rpe: 8 },
                            { id: 'wo5-8', reps: 10, weight: 25, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: '2oEkViofmMxIUFoURTV1',
                        exerciseName: 'Pull Ups',
                        note: '5 sets of 10 reps (Chin-ups / Lat Pulldown) to balance vertical pressing.',
                        sets: [
                            { id: 'wo5-9', reps: 10, rpe: 8 },
                            { id: 'wo5-10', reps: 10, rpe: 8 },
                            { id: 'wo5-11', reps: 10, rpe: 8.5 },
                            { id: 'wo5-12', reps: 10, rpe: 8.5 },
                            { id: 'wo5-13', reps: 10, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'gyT3tonFeTOQtAuDRuF5',
                        exerciseName: 'Tricep Pushdown',
                        note: '3 sets of 12–15 reps.',
                        sets: [
                            { id: 'wo5-14', reps: 15, weight: 22.5, rpe: 8.5 },
                            { id: 'wo5-15', reps: 15, weight: 22.5, rpe: 9 },
                            { id: 'wo5-16', reps: 15, weight: 22.5, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_dl_5s: {
                name: '5/3/1 Deadlift (Week 1: 5s + BBB)',
                notes: 'Main Sets: 65% x 5, 75% x 5, 85% x 5+ (AMRAP). BBB: 5x10 @ 50% TM (can substitute RDL if lower back fatigues).',
                exercises: [
                    {
                        exerciseId: 'W0YdnVZE7hZLaeapNAJm',
                        exerciseName: 'Deadlift',
                        note: 'Sets 1–3: 65%, 75%, 85% AMRAP (5+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wd5-1', reps: 5, weight: 80, rpe: 6.5 },
                            { id: 'wd5-2', reps: 5, weight: 90, rpe: 7.5 },
                            { id: 'wd5-3', reps: 7, weight: 102.5, rpe: 9 },
                            { id: 'wd5-4', reps: 10, weight: 60, rpe: 7 },
                            { id: 'wd5-5', reps: 10, weight: 60, rpe: 7.5 },
                            { id: 'wd5-6', reps: 10, weight: 60, rpe: 8 },
                            { id: 'wd5-7', reps: 10, weight: 60, rpe: 8 },
                            { id: 'wd5-8', reps: 10, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'AKU96E3Mav0ix07oYEnS',
                        exerciseName: 'Hanging Leg Raise',
                        note: '5 sets of 10–15 reps for anterior core stability.',
                        sets: [
                            { id: 'wd5-9', reps: 12, rpe: 8 },
                            { id: 'wd5-10', reps: 12, rpe: 8 },
                            { id: 'wd5-11', reps: 12, rpe: 8.5 },
                            { id: 'wd5-12', reps: 12, rpe: 8.5 },
                            { id: 'wd5-13', reps: 12, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_bp_5s: {
                name: '5/3/1 Bench Press (Week 1: 5s + BBB)',
                notes: 'Main Sets: 65% x 5, 75% x 5, 85% x 5+ (AMRAP). BBB: 5x10 @ 50% TM. Pair with heavy rowing & rear delts.',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: 'Sets 1–3: 65%, 75%, 85% AMRAP (5+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wb5-1', reps: 5, weight: 52.5, rpe: 6.5 },
                            { id: 'wb5-2', reps: 5, weight: 60, rpe: 7.5 },
                            { id: 'wb5-3', reps: 8, weight: 67.5, rpe: 9 },
                            { id: 'wb5-4', reps: 10, weight: 40, rpe: 7 },
                            { id: 'wb5-5', reps: 10, weight: 40, rpe: 7.5 },
                            { id: 'wb5-6', reps: 10, weight: 40, rpe: 8 },
                            { id: 'wb5-7', reps: 10, weight: 40, rpe: 8 },
                            { id: 'wb5-8', reps: 10, weight: 40, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'MnwbeTJlcY6NvW0YTuy9',
                        exerciseName: 'One Arm Dumbbell Bent Over Row',
                        note: '5 sets of 10 reps/arm.',
                        sets: [
                            { id: 'wb5-9', reps: 10, weight: 22, rpe: 8 },
                            { id: 'wb5-10', reps: 10, weight: 22, rpe: 8 },
                            { id: 'wb5-11', reps: 10, weight: 22, rpe: 8.5 },
                            { id: 'wb5-12', reps: 10, weight: 22, rpe: 8.5 },
                            { id: 'wb5-13', reps: 10, weight: 22, rpe: 9 },
                        ]
                    },
                    {
                        exerciseId: 'rXi6Xy7qcZUPxM4r8uPJ',
                        exerciseName: 'Face Pull',
                        note: '3 sets of 15 reps for shoulder health.',
                        sets: [
                            { id: 'wb5-14', reps: 15, weight: 20, rpe: 8 },
                            { id: 'wb5-15', reps: 15, weight: 20, rpe: 8.5 },
                            { id: 'wb5-16', reps: 15, weight: 20, rpe: 8.5 },
                        ]
                    }
                ]
            },
            w531_sq_5s: {
                name: '5/3/1 Squat (Week 1: 5s + BBB)',
                notes: 'Main Sets: 65% x 5, 75% x 5, 85% x 5+ (AMRAP). BBB: 5x10 @ 50% TM.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: 'Sets 1–3: 65%, 75%, 85% AMRAP (5+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'ws5-1', reps: 5, weight: 65, rpe: 6.5 },
                            { id: 'ws5-2', reps: 5, weight: 75, rpe: 7.5 },
                            { id: 'ws5-3', reps: 7, weight: 85, rpe: 9 },
                            { id: 'ws5-4', reps: 10, weight: 50, rpe: 7 },
                            { id: 'ws5-5', reps: 10, weight: 50, rpe: 7.5 },
                            { id: 'ws5-6', reps: 10, weight: 50, rpe: 8 },
                            { id: 'ws5-7', reps: 10, weight: 50, rpe: 8 },
                            { id: 'ws5-8', reps: 10, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '5 sets of 10 reps for hamstring balance.',
                        sets: [
                            { id: 'ws5-9', reps: 10, weight: 40, rpe: 8 },
                            { id: 'ws5-10', reps: 10, weight: 40, rpe: 8 },
                            { id: 'ws5-11', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'ws5-12', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'ws5-13', reps: 10, weight: 40, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_ohp_3s: {
                name: '5/3/1 OHP (Week 2: 3s + BBB)',
                notes: 'Main Sets: 70% x 3, 80% x 3, 90% x 3+ (AMRAP). BBB: 5x10 @ 50% TM.',
                exercises: [
                    {
                        exerciseId: 'kT8zskrYL6Y2e72uKyeD',
                        exerciseName: 'Shoulder Press',
                        note: 'Sets 1–3: 70%, 80%, 90% AMRAP (3+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wo3-1', reps: 3, weight: 35, rpe: 7 },
                            { id: 'wo3-2', reps: 3, weight: 40, rpe: 8 },
                            { id: 'wo3-3', reps: 5, weight: 45, rpe: 9 },
                            { id: 'wo3-4', reps: 10, weight: 25, rpe: 7 },
                            { id: 'wo3-5', reps: 10, weight: 25, rpe: 7.5 },
                            { id: 'wo3-6', reps: 10, weight: 25, rpe: 8 },
                            { id: 'wo3-7', reps: 10, weight: 25, rpe: 8 },
                            { id: 'wo3-8', reps: 10, weight: 25, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: '2oEkViofmMxIUFoURTV1',
                        exerciseName: 'Pull Ups',
                        note: '5 sets of 10 reps.',
                        sets: [
                            { id: 'wo3-9', reps: 10, rpe: 8 },
                            { id: 'wo3-10', reps: 10, rpe: 8 },
                            { id: 'wo3-11', reps: 10, rpe: 8.5 },
                            { id: 'wo3-12', reps: 10, rpe: 8.5 },
                            { id: 'wo3-13', reps: 10, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_dl_3s: {
                name: '5/3/1 Deadlift (Week 2: 3s + BBB)',
                notes: 'Main Sets: 70% x 3, 80% x 3, 90% x 3+ (AMRAP). BBB: 5x10 @ 50% TM.',
                exercises: [
                    {
                        exerciseId: 'W0YdnVZE7hZLaeapNAJm',
                        exerciseName: 'Deadlift',
                        note: 'Sets 1–3: 70%, 80%, 90% AMRAP (3+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wd3-1', reps: 3, weight: 85, rpe: 7 },
                            { id: 'wd3-2', reps: 3, weight: 95, rpe: 8 },
                            { id: 'wd3-3', reps: 5, weight: 107.5, rpe: 9 },
                            { id: 'wd3-4', reps: 10, weight: 60, rpe: 7 },
                            { id: 'wd3-5', reps: 10, weight: 60, rpe: 7.5 },
                            { id: 'wd3-6', reps: 10, weight: 60, rpe: 8 },
                            { id: 'wd3-7', reps: 10, weight: 60, rpe: 8 },
                            { id: 'wd3-8', reps: 10, weight: 60, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'AKU96E3Mav0ix07oYEnS',
                        exerciseName: 'Hanging Leg Raise',
                        note: '5 sets of 12 reps.',
                        sets: [
                            { id: 'wd3-9', reps: 12, rpe: 8 },
                            { id: 'wd3-10', reps: 12, rpe: 8.5 },
                            { id: 'wd3-11', reps: 12, rpe: 8.5 },
                            { id: 'wd3-12', reps: 12, rpe: 9 },
                            { id: 'wd3-13', reps: 12, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_bp_3s: {
                name: '5/3/1 Bench Press (Week 2: 3s + BBB)',
                notes: 'Main Sets: 70% x 3, 80% x 3, 90% x 3+ (AMRAP). BBB: 5x10 @ 50% TM.',
                exercises: [
                    {
                        exerciseId: 'LKq7anKwoz3rg3gbOI3Z',
                        exerciseName: 'Bench Press',
                        note: 'Sets 1–3: 70%, 80%, 90% AMRAP (3+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'wb3-1', reps: 3, weight: 55, rpe: 7 },
                            { id: 'wb3-2', reps: 3, weight: 65, rpe: 8 },
                            { id: 'wb3-3', reps: 5, weight: 72.5, rpe: 9 },
                            { id: 'wb3-4', reps: 10, weight: 40, rpe: 7 },
                            { id: 'wb3-5', reps: 10, weight: 40, rpe: 7.5 },
                            { id: 'wb3-6', reps: 10, weight: 40, rpe: 8 },
                            { id: 'wb3-7', reps: 10, weight: 40, rpe: 8 },
                            { id: 'wb3-8', reps: 10, weight: 40, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'MnwbeTJlcY6NvW0YTuy9',
                        exerciseName: 'One Arm Dumbbell Bent Over Row',
                        note: '5 sets of 10 reps/arm.',
                        sets: [
                            { id: 'wb3-9', reps: 10, weight: 22, rpe: 8 },
                            { id: 'wb3-10', reps: 10, weight: 22, rpe: 8 },
                            { id: 'wb3-11', reps: 10, weight: 22, rpe: 8.5 },
                            { id: 'wb3-12', reps: 10, weight: 22, rpe: 8.5 },
                            { id: 'wb3-13', reps: 10, weight: 22, rpe: 9 },
                        ]
                    }
                ]
            },
            w531_sq_3s: {
                name: '5/3/1 Squat (Week 2: 3s + BBB)',
                notes: 'Main Sets: 70% x 3, 80% x 3, 90% x 3+ (AMRAP). BBB: 5x10 @ 50% TM.',
                exercises: [
                    {
                        exerciseId: 'OX5qC5VKlZCk9hVv4SoF',
                        exerciseName: 'Squat',
                        note: 'Sets 1–3: 70%, 80%, 90% AMRAP (3+). Sets 4–8: 5x10 @ 50% TM.',
                        sets: [
                            { id: 'ws3-1', reps: 3, weight: 70, rpe: 7 },
                            { id: 'ws3-2', reps: 3, weight: 80, rpe: 8 },
                            { id: 'ws3-3', reps: 5, weight: 90, rpe: 9 },
                            { id: 'ws3-4', reps: 10, weight: 50, rpe: 7 },
                            { id: 'ws3-5', reps: 10, weight: 50, rpe: 7.5 },
                            { id: 'ws3-6', reps: 10, weight: 50, rpe: 8 },
                            { id: 'ws3-7', reps: 10, weight: 50, rpe: 8 },
                            { id: 'ws3-8', reps: 10, weight: 50, rpe: 8.5 },
                        ]
                    },
                    {
                        exerciseId: 'UTfHUCzNhkohA0uO9NnN',
                        exerciseName: 'Seated Leg Curl',
                        note: '5 sets of 10 reps.',
                        sets: [
                            { id: 'ws3-9', reps: 10, weight: 40, rpe: 8 },
                            { id: 'ws3-10', reps: 10, weight: 40, rpe: 8 },
                            { id: 'ws3-11', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'ws3-12', reps: 10, weight: 40, rpe: 8.5 },
                            { id: 'ws3-13', reps: 10, weight: 40, rpe: 9 },
                        ]
                    }
                ]
            }
        }
    }
];
