import axios from 'axios';
import { popWelcome } from '../queue.js';

// --- Simpel "mailafsender" (log som bevis) ---
function sendEmail(to, subject, body) {
  console.log(`[MAIL] to=${to} subject="${subject}" body="${body.slice(0,50)}..."`);
}

// --- A) Velkomstmails fra kø (helt afkoblet) ---
export async function processWelcomeQueue() {
  const msg = await popWelcome();
  if (!msg) return false; // ingenting at behandle
  sendEmail(msg.email, 'Welcome to HappyHeadlines 🎉', `Hi ${msg.name || ''}, welcome aboard!`);
  return true;
}

// --- B) Daglig udsendelse (med fault isolation) ---
let failureCount = 0;
let circuitOpen = false;
const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT = 30000;

export async function fetchActiveSubscribersWithCB() {
  if (circuitOpen) {
    console.warn('[CB] circuit open – returning empty list');
    return []; // fallback
  }
  try {
    const r = await axios.get(`${process.env.SUBSCRIBER_API}/subscribers`, { timeout: 3000 });
    failureCount = 0;
    return r.data;
  } catch (e) {
    failureCount++;
    console.error('[CB] error calling SubscriberService:', e.message);
    if (failureCount >= FAILURE_THRESHOLD) {
      circuitOpen = true;
      console.warn('[CB] opening circuit for 30s');
      setTimeout(() => { circuitOpen = false; failureCount = 0; console.warn('[CB] reset'); }, RESET_TIMEOUT);
    }
    return []; // fault isolation fallback
  }
}
