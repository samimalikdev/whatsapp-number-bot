import express from 'express';
import fs from 'fs';
import { PORT } from './config/constants.js';

export function setupServer() {
    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({
            status: 'active',
            bot: 'Number Details Bot',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    app.get('/qr', (req, res) => {
        const qrPath = './qr.png';
        if (fs.existsSync(qrPath)) {
            res.sendFile(qrPath, { root: '.' });
        } else {
            res.send('QR code not ready yet');
        }
    });

    app.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    const server = app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    return server;
}
