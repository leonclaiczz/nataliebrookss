import { Redis } from '@upstash/redis';

// Funktioniert mit Upstash direkt (UPSTASH_*) und mit der Vercel-Marketplace-Integration (KV_*)
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export const dayKey = (model: string, day: string) => `f:${model}:${day}`;
