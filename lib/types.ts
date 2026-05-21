import { z } from 'zod';

export const AudienceSchema = z.enum(['teen', 'adult']);
export type Audience = z.infer<typeof AudienceSchema>;

export const TimeBucketSchema = z.enum(['15min', '1hr', '3hr', 'fullday']);
export type TimeBucket = z.infer<typeof TimeBucketSchema>;

export const EnergySchema = z.enum(['low', 'medium', 'high']);
export type Energy = z.infer<typeof EnergySchema>;

export const MoodSchema = z.enum(['calm', 'curious', 'restless', 'social']);
export type Mood = z.infer<typeof MoodSchema>;

export const TimeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'late_night']);
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

export const CategorySchema = z.enum([
  'restful',
  'productive',
  'creative',
  'social',
  'physical',
  'learning',
  'nostalgic',
]);
export type Category = z.infer<typeof CategorySchema>;

export const CostSchema = z.enum(['free', 'low', 'medium']);
export type Cost = z.infer<typeof CostSchema>;

export const BudgetTierSchema = z.enum(['free', 'under5', 'under10', 'under50']);
export type BudgetTier = z.infer<typeof BudgetTierSchema>;

export const LocationSchema = z.enum(['home', 'neighbourhood', 'island-wide', 'online']);
export type Location = z.infer<typeof LocationSchema>;

export const ContextSchema = z.enum([
  'home',
  'commuting',
  'office',
  'outdoor',
  'cafe',
  'with_friend',
]);
export type Context = z.infer<typeof ContextSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(240),
  duration_min: z.number().int().positive().max(1440),
  tags: z.object({
    energy: z.array(EnergySchema).min(1),
    mood: z.array(MoodSchema).min(1),
    timeOfDay: z.preprocess(
      (v) => {
        if (!Array.isArray(v)) return v;
        const valid = TimeOfDaySchema.options as readonly string[];
        const filtered = v.filter((x) => typeof x === 'string' && valid.includes(x));
        return filtered.length > 0 ? filtered : ['afternoon'];
      },
      z.array(TimeOfDaySchema).min(1),
    ),
    category: z.preprocess(
      (v) => (Array.isArray(v) ? v[0] : v),
      CategorySchema,
    ),
    indoor: z.boolean(),
    cost: CostSchema,
    cost_sgd: z.number().min(0).max(500).optional(),
    budget_tier: BudgetTierSchema.optional(),
    location: LocationSchema.optional(),
    includes_transport: z.boolean().optional(),
    sg_local: z.boolean().optional(),
    compatible_contexts: z.array(ContextSchema).optional(),
  }),
  link: z.string().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const PoolSchema = z.object({
  generated_at: z.string(),
  audience: AudienceSchema,
  activities: z.array(ActivitySchema).min(1),
});
export type Pool = z.infer<typeof PoolSchema>;

export type Filters = {
  audience: Audience;
  time: TimeBucket;
  energy: Energy;
  mood: Mood;
  budget?: BudgetTier | 'any';
  rainy?: boolean;
  context?: Context | 'anywhere';
};

export type SampleOptions = {
  count?: number;
  antiDoomscroll?: boolean;
  currentTimeOfDay?: TimeOfDay;
  excludeIds?: string[];
};
