import dotenv from 'dotenv';
dotenv.config();

export const BLOCKED_NUMBERS = [
    'OWN NUMBERS',
];

export const API_CONFIG = {
    BASE_URL: process.env.NEW,
    TIMEOUT: 10000
};

export const RATE_LIMIT = {
    MAX_REQUESTS: 5,
    TIME_WINDOW: 60000
};

export const MAX_RECONNECT_ATTEMPTS = 5;
export const PORT = process.env.PORT || 3000;
