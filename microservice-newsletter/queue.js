
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const QUEUE_KEY = 'subscriber_queue';

export async function popWelcome() {
  const msg = await redis.rpop(QUEUE_KEY); // FIFO (lpush + rpop)
  return msg ? JSON.parse(msg) : null;
}
