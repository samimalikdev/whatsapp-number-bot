import axios from 'axios';
import { API_CONFIG } from '../config/constants.js';

export async function searchPhoneNumber(query) {
    try {
        const response = await axios.post(
            API_CONFIG.BASE_URL,
            { query: query },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'User-Agent': 'WhatsApp-NumberSearch-Bot/1.0'
                },
                timeout: API_CONFIG.TIMEOUT
            }
        );

        if (response.data && response.data.success) {
            return response.data;
        }

        return {
            success: false,
            message: response.data?.message || 'No data found',
            results: []
        };

    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
    }
}
