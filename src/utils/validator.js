export function cleanPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+92')) {
        cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('92')) {
        cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    if (/^3\d{9}$/.test(cleaned)) {
        return cleaned;
    }

    return null;
}
