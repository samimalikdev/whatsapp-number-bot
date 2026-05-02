import { RATE_LIMIT } from '../config/constants.js';

const rateLimiter = new Map();

export function checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = rateLimiter.get(userId) || [];

    const validRequests = userRequests.filter(time => now - time < RATE_LIMIT.TIME_WINDOW);

    if (validRequests.length >= RATE_LIMIT.MAX_REQUESTS) {
        return false;
    }

    validRequests.push(now);
    rateLimiter.set(userId, validRequests);

    return true;
}

export function cleanupRateLimiter() {
    const now = Date.now();
    for (const [userId, requests] of rateLimiter.entries()) {
        const validRequests = requests.filter(time => now - time < RATE_LIMIT.TIME_WINDOW);
        if (validRequests.length === 0) {
            rateLimiter.delete(userId);
        } else {
            rateLimiter.set(userId, validRequests);
        }
    }
}
