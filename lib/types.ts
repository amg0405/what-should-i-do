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

export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(240),
  duration_min: z.number().int().positive().max(1440),
  tags: z.object({
    energy: z.array(EnergySchema).min(1),
    mood: z.array(MoodSchema).min(1),
    timeOfDay: z.array(TimeOfDaySchema).min(1),
    category: z.preprocess(
      (v) => (Array.isArray(v) ? v[0] : v),
      CategorySchema,
    ),
    indoor: z.boolean(),
    cost: CostSchema,
  }),
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
};

export type SampleOptions = {
  count?: number;
  antiDoomscroll?: boolean;
  currentTimeOfDay?: TimeOfDay;
  excludeIds?: string[];
};
