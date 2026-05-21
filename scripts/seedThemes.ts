import type { Audience } from '../lib/types';

export const AUDIENCE_DESCRIPTIONS: Record<Audience, string> = {
  teen: `Gen Z based in Singapore (born ~2007-2008), just finished JC / poly / O-levels or in early ITE/JC/polytechnic, on a long break. Lives at home (HDB or condo), often near MRT. Limited pocket money — S$0-30 per outing typical. Locally fluent: knows the MRT lines, hawker centres, ActiveSG, NLB branches, Park Connectors, the difference between kopi-o and kopi-c kosong. Cultural fluency mix: grew up on Pokemon, Beyblade, K-drama, anime, Cartoon Network, Studio Ghibli, Indian-Singaporean teens know Bollywood and Tamil cinema too. Mix of leisure desire and pressure about the future (uni admissions, NS for the guys, picking a poly course, parents asking what next).`,
  adult: `Working professional in Singapore, ~26-35. Lives in HDB / rental condo / shared apartment. Disposable income S$3000-8000/month after CPF and rent, but time-scarce. Has Saturday/Sunday + occasional 2-4 hour weekday-evening idle pockets. Defaults to phone, streaming, food delivery when bored. Wants the idle time to feel intentional — hobbies they keep meaning to start, friends they keep meaning to call, errands deferred, half-finished side projects. Familiar with: MRT, EZ-Link, F&B-heavy social culture, Park Connectors, hawker culture, the ArtScience / NMS / NGS, ActiveSG, indoor climbing gyms, Tiong Bahru / Joo Chiat / Holland V / Tanjong Pagar / CBD weekend life.`,
};

export const SEED_THEMES: Record<Audience, string[]> = {
  teen: [
    `Hawker + heartland adventures: trying a new stall at Maxwell / Old Airport Road / Adam Road / Ghim Moh / Tiong Bahru Market, kopi-o or kaya toast runs at the void-deck coffeeshop, chendol or ice kachang after dinner, exploring a neighbourhood you've never gotten off at on the MRT. Mostly under S$10 incl. fare.`,
    `Outdoor SG: Park Connector cycling (rent SG Bike or Anywheel), East Coast Park sunrise, Marina Barrage rooftop, Pulau Ubin bumboat + bike, MacRitchie reservoir walk, Henderson Waves, Southern Ridges, Bishan-AMK Park, gully badminton at HDB courts. Cost: free to under S$20 incl. fare.`,
    `Creative & nostalgic: doodling to one album, design fake Pokemon gym leader cards, write a short anime fanfic, photograph one neighbourhood block in 20 photos, recreate a meme using friends, make ondeh-ondeh from a YouTube tutorial. Indoor + home.`,
    `Skill / study prep: one Codeforces / LeetCode easy problem, 25-min focused study sprint with Forest, build a tiny portfolio site on Vercel, learn 10 Mandarin / Malay / Tamil phrases on Duolingo, one Khan Academy chapter, IPPT prep for the guys. Free.`,
    `Social — call/meet a friend: text the secondary school WhatsApp group, organise a kopitiam meet-up, board game at a friend's HDB, video call a cousin abroad, JC reunion. Free to under S$15.`,
    `Mindful & restful: journal at Bishan Park, sit on the balcony watching the sky, breathe like a SEAL (4-7-8) for 10 min, take a walk without your phone, nap intentionally for 25 min, dawn walk before the heat. Free.`,
  ],
  adult: [
    `Hawker + neighbourhood explorations: lunch challenge at a new hawker (Maxwell, Tiong Bahru, Amoy Street, Tanjong Pagar Plaza), kopi + kaya toast at a coffeeshop you've never been to, a quiet weekday dinner solo at Old Airport Road, exploring Joo Chiat's Peranakan shophouses, Tiong Bahru's bakeries. Under S$15 incl. fare.`,
    `Outdoor + active SG: a Park Connector cycle (rent SG Bike), East Coast Park sunset, ActiveSG swim or gym, Sentosa boardwalk, climbing day pass at Boruca / BFF / Climb Central off-peak, Botanic Gardens picnic, a hike at Bukit Timah. Under S$30 incl. fare.`,
    `Culture + curiosity: a free museum afternoon (NMS, NGS, ArtScience on certain days), a play at Esplanade outdoor stage, a film at The Projector off-peak, a Bras Basah library random-book browse, a record store stop in Bras Basah Complex. Under S$25 incl. fare.`,
    `Hobbies you keep putting off: 20 pages of the book on your bedside, one piano practice session, the recipe you bookmarked months ago, the half-finished side project, an Italian / Japanese phrase lesson. Mostly home, free.`,
    `Social rekindling: voice-note one friend you owe a reply, a thank-you message to a mentor, a 25-min phone call (not text) with a cousin, organising a weekday-evening dinner with one specific person, hosting a kopi at your place. Free.`,
    `Domestic projects + low-effort wellness: clear one drawer in your HDB, sort your laundry rack, deep-clean your coffee setup, a 10-min stretch, sunlight on the balcony, hydrate properly, prep one healthy lunchbox for tomorrow. Free.`,
  ],
};
