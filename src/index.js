import { startBot } from './bot.js';
import { setupServer } from './server.js';
import { cleanupRateLimiter } from './utils/rateLimiter.js';
import { RATE_LIMIT } from './config/constants.js';

async function main() {
    console.log('Number Details Bot Starting...');

    const server = setupServer();

    try {
        await startBot();
    } catch (error) {
        console.error('Startup error:', error);
        server.close();
        setTimeout(main, 10000);
    }
}

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});

setInterval(cleanupRateLimiter, RATE_LIMIT.TIME_WINDOW);

main().catch(console.error);
