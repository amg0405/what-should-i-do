import { PoolSchema, type Audience, type Pool } from './types';
import teenJson from '../data/pool.teen.json';
import adultJson from '../data/pool.adult.json';

const POOLS: Record<Audience, Pool> = {
  teen: PoolSchema.parse(teenJson),
  adult: PoolSchema.parse(adultJson),
};

export function getPool(audience: Audience): Pool {
  return POOLS[audience];
}
