import type { Audience } from '../lib/types';

export const AUDIENCE_DESCRIPTIONS: Record<Audience, string> = {
  teen: 'Indian Gen Z (born ~2008), just finished 12th grade or in early college, on a long summer break before college starts. Lives at home, mostly free, limited budget (often ₹0). Grew up on 2000s/2010s Indian and international pop culture (Pokemon, Beyblade, Cartoon Network, Hannah Montana, Doraemon, Mr. Bean cartoons, Shinchan, MS Dhoni cricket years, early YouTube). Mix of leisure desire and pressure about future (college, JEE/NEET aftermath, picking a stream, parents asking what next).',
  adult:
    'Working professional in India, ~28-35, busy weekdays but has occasional 2-4 hour idle pockets on weekends or weekday evenings. Disposable income but time-poor. Often defaulting to phone/streaming when bored. Wants to feel like the idle time was used well — hobbies they keep meaning to start, friends they keep meaning to call, errands they keep deferring.',
};

export const SEED_THEMES: Record<Audience, string[]> = {
  teen: [
    'Nostalgia and comfort: 2000s-2010s cartoons, retro video games, childhood snacks, old TV shows. Specific shows and games are great.',
    'Skill-building and academic prep: free DSA practice, sketching, languages on Duolingo, internship applications, a tiny portfolio website, exam prep games.',
    'Physical and outdoor: walks, cycling, gully cricket, badminton, body-weight workouts, mall walking — Indian climate aware (hot afternoons, monsoon).',
    'Creative output: writing, music, video editing, photography, doodling, journaling, fanfic, making memes.',
    'Social and relational: calling a school friend, hanging out with siblings, talking to grandparents, hosting a friend, organizing a meet-up.',
    'Mindful and restful: journaling, meditation apps, intentional naps, breathwork, walking without phone, sky-watching.',
  ],
  adult: [
    'Hobbies you keep putting off: a tiny musical instrument practice, the half-finished book on the shelf, a recipe bookmarked months ago.',
    'Career-adjacent learning: a craft skill (not productivity-bro). One Coursera lecture, one tutorial, one talk on YouTube.',
    'Social rekindling: a phone call you owe, a voice note to an old friend, a thank-you text to a mentor, a check-in with a cousin.',
    'Low-effort wellness: 10 min stretch, hydrate properly, 15 min sunlight walk, a cold shower, a digital detox hour.',
    'Domestic projects: one drawer, one shelf, one repair, one recipe, watering plants, deep-cleaning one small thing.',
    'Solitude with purpose: read 20 pages, write a journal entry, sit on the balcony, take a walk without phone, browse photos.',
  ],
};
