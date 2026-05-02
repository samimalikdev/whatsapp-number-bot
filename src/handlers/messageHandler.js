import { BLOCKED_NUMBERS } from '../config/constants.js';
import { cleanPhoneNumber } from '../utils/validator.js';
import { checkRateLimit } from '../utils/rateLimiter.js';
import { formatSearchResult, formatCNICSearchResult, extractCnicNumbers } from '../utils/formatter.js';
import { searchPhoneNumber } from '../services/apiService.js';

export async function handleMessages(sock, messages) {
    for (const msg of messages) {
        if (!msg.message) continue;

        let text = '';
        if (msg.message.conversation) text = msg.message.conversation;
        else if (msg.message.extendedTextMessage) text = msg.message.extendedTextMessage.text;

        if (!text || msg.key.fromMe) continue;

        const chatId = msg.key.remoteJid;
        const userId = msg.key.participant || chatId;

        try {
            if (text.toLowerCase() === 'test') {
                await sock.sendMessage(chatId, { text: 'Bot is working!\nSend !help for commands' });
            }
            else if (text === '!help') {
                await sock.sendMessage(chatId, {
                    text: `*Phone Number Search Bot*\n\n` +
                        `*Commands:*\n` +
                        `• !search <phone_number> - Search phone number data\n` +
                        `• !help - Show this message\n` +
                        `• !info - Show developer information\n` +
                        `• test - Test bot\n\n` +
                        `*Examples:*\n` +
                        `!search 03123456789\n` +
                        `!search +923123456789\n\n` +
                        `*Rate Limits:*\n` +
                        `• Max 5 searches per minute\n\n` +
                        `*Supported formats:*\n` +
                        `• 03xxxxxxxxx\n` +
                        `• +923xxxxxxxxx\n` +
                        `• 923xxxxxxxxx\n` +
                        `• 3xxxxxxxxx\n\n` +
                        `${'─'.repeat(35)}\n` +
                        `_Created by Sami Malik_`
                });
            }
            else if (text === '!info') {
                await sock.sendMessage(chatId, {
                    text:
                        `*Developer Information*\n
*Name:* Sami Malik\n\n
*About Me:*\n
I'm a full-stack mobile & web developer with hands-on experience in building Android apps, iOS apps, Flutter apps, and powerful backend systems. I also work on WhatsApp automation, custom bots, and real-world API based solutions.\n\n
*Skills & Expertise:*\n
• Flutter Development (Android & iOS)\n
• Native Android (Kotlin)\n
• iOS App Development\n
• Backend (Node.js & Express.js)\n
• Databases (SQL & NoSQL)\n
• Full-Stack Development\n
• Cloud Deployment (AWS, Firebase, Vercel)\n
• Reverse Engineering\n
• WhatsApp Bot & Automation\n\n
*Let's Connect:*\n
WhatsApp: https://whatsapp.com/channel/0029Va9bWJa3QxS0N7sNcu00\n
Instagram: https://www.instagram.com/iamsamimalik\n
Telegram: https://t.me/SamiGaming\n
LinkedIn: https://www.linkedin.com/in/sami-malik-950665273\n
GitHub: https://github.com/samimalikdev\n\n
Thanks for using my bot!`
                });
            }
            else if (text.startsWith('!search ')) {
                const phoneNumber = text.split(' ')[1];

                if (!phoneNumber) {
                    await sock.sendMessage(chatId, {
                        text: 'Please provide a phone number\n\nExample:\n!search 03345445687'
                    });
                    continue;
                }

                if (!checkRateLimit(userId)) {
                    await sock.sendMessage(chatId, {
                        text: 'Rate limit exceeded. Please wait a minute before making more requests.'
                    });
                    continue;
                }

                const cleanedNumber = cleanPhoneNumber(phoneNumber);
                if (!cleanedNumber) {
                    await sock.sendMessage(chatId, {
                        text: 'Invalid phone number format\n\nSupported formats:\n• 03xxxxxxxxx\n• +923xxxxxxxxx\n• 923xxxxxxxxx\n• 3xxxxxxxxx'
                    });
                    continue;
                }

                if (BLOCKED_NUMBERS.includes(cleanedNumber)) {
                    await sock.sendMessage(chatId, {
                        text: '*Restricted Search*\n\n' +
                            'This number is restricted from search.\n\n' +
                            '_Created by Sami Malik_'
                    });
                    continue;
                }

                await sock.sendMessage(chatId, { text: 'Searching phone number data, please wait...' });

                try {
                    const result = await searchPhoneNumber(cleanedNumber);

                    if (result.success && result.results && result.results.length > 0) {
                        const responseText = formatSearchResult(result.results, cleanedNumber);
                        await sock.sendMessage(chatId, { text: responseText });

                        const cnicNumbers = extractCnicNumbers(result.results);
                        if (cnicNumbers.length > 0) {
                            await sock.sendMessage(chatId, {
                                text: `Found ${cnicNumbers.length} CNIC(s), searching for additional information...`
                            });

                            for (const cnic of cnicNumbers) {
                                try {
                                    const cnicResult = await searchPhoneNumber(cnic);
                                    if (cnicResult.success && cnicResult.results && cnicResult.results.length > 0) {
                                        const cnicResponseText = formatCNICSearchResult(cnicResult.results, cnic);
                                        await sock.sendMessage(chatId, { text: cnicResponseText });
                                    }
                                } catch (cnicErr) {
                                    await sock.sendMessage(chatId, {
                                        text: `Could not fetch additional data for CNIC: ${cnic}`
                                    });
                                }
                            }
                        }
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `No data found for phone number: ${cleanedNumber}`
                        });
                    }
                } catch (err) {
                    await sock.sendMessage(chatId, {
                        text: `Search failed: ${err.message || 'Unknown error occurred'}`
                    });
                }
            }
            else if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
                await sock.sendMessage(chatId, {
                    text: 'Hello! Send !help to see available commands'
                });
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: 'An error occurred while processing your request. Please try again.'
            });
        }
    }
}
