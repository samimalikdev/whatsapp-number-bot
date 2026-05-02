import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import pino from 'pino';
import QRCode from 'qrcode';
import { MAX_RECONNECT_ATTEMPTS } from './config/constants.js';
import { handleMessages } from './handlers/messageHandler.js';

const logger = pino({ level: 'silent' });
let reconnectAttempts = 0;

export async function startBot() {
    try {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using WA version: ${version.join('.')}, isLatest: ${isLatest}`);

        const { state, saveCreds } = await useMultiFileAuthState('auth_info');

        const sock = makeWASocket({
            version,
            auth: state,
            logger,
            browser: ['Number Details Bot', 'Chrome', '3.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            qrTimeout: 60000,
            retryRequestDelayMs: 250,
            emitOwnEvents: false,
            getMessage: async () => {
                return { conversation: '' }
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                const qrPath = './qr.png';
                await QRCode.toFile(qrPath, qr, { type: 'png', scale: 8 });
                console.log(`QR code saved as ${qrPath}`);
                reconnectAttempts = 0;
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error instanceof Boom
                    ? lastDisconnect.error.output?.statusCode
                    : null;

                console.log('Connection closed. Status:', statusCode);

                if (statusCode === DisconnectReason.loggedOut) {
                    if (fs.existsSync('auth_info')) {
                        fs.rmSync('auth_info', { recursive: true, force: true });
                    }
                    reconnectAttempts = 0;
                    setTimeout(startBot, 3000);
                }
                else {
                    reconnectAttempts++;
                    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                        console.log('Max reconnection attempts reached.');
                        process.exit(1);
                    }
                    const delay = statusCode === 405 ? reconnectAttempts * 5000 : 5000;
                    setTimeout(startBot, delay);
                }
            }
            else if (connection === 'open') {
                console.log('CONNECTED SUCCESSFULLY');
                reconnectAttempts = 0;
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages }) => {
            await handleMessages(sock, messages);
        });

        return sock;
    } catch (error) {
        console.error('Error in startBot:', error);
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            process.exit(1);
        }
        setTimeout(startBot, 10000);
    }
}
