export function formatSearchResult(results, phoneNumber) {
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });

    const networkGroups = {};
    results.forEach(item => {
        const network = item.network || 'Unknown';
        if (!networkGroups[network]) {
            networkGroups[network] = [];
        }
        networkGroups[network].push(item);
    });

    let result = `*Phone Number Result*\n\n`;
    result += `*Searched Number:* ${phoneNumber}\n\n`;

    Object.keys(networkGroups).forEach(network => {
        const items = networkGroups[network];
        result += `*${network.toUpperCase()} Network:*\n`;

        items.forEach((item, index) => {
            result += `${index + 1}. `;

            if (item.name) result += `*Name:* ${item.name}\n`;
            if (item.number) result += `   *Mobile:* ${item.number}\n`;
            if (item.cnic) result += `   *CNIC:* ${item.cnic}\n`;
            if (item.status || item.connection_status) result += `   *Connection Status:* ${item.status || item.connection_status}\n`;
            if (item.connection_type) result += `   *Connection Type:* ${item.connection_type}\n`;
            if (item.data_sim !== undefined) result += `   *Data SIM:* ${item.data_sim === 'Yes' || item.data_sim === true ? 'Yes' : 'No'}\n`;
            if (item.imsi) result += `   *IMSI:* ${item.imsi}\n`;
            if (item.address) result += `   *Address:* ${item.address}\n`;
            if (item.city) result += `   *City:* ${item.city}\n`;
            if (item.bvs_status) result += `   *BVS Status:* ${item.bvs_status}\n`;
            if (item.bvs_date) result += `   *BVS Date:* ${item.bvs_date}\n`;
            if (item.connection_date) result += `   *Connection Date:* ${item.connection_date}\n`;

            if (index < items.length - 1) result += `\n`;
        });

        result += `\n${'─'.repeat(35)}\n\n`;
    });

    result += `*Search Time:* ${timestamp}\n`;
    result += `${'─'.repeat(35)}\n`;
    result += `_Created by Sami Malik_`;

    return result;
}

export function formatCNICSearchResult(results, cnic) {
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });

    const networkGroups = {};
    results.forEach(item => {
        const network = item.network || 'Unknown';
        if (!networkGroups[network]) {
            networkGroups[network] = [];
        }
        networkGroups[network].push(item);
    });

    let result = `*CNIC Result*\n\n`;
    result += `*CNIC:* ${cnic}\n\n`;

    Object.keys(networkGroups).forEach(network => {
        const items = networkGroups[network];
        result += `*${network.toUpperCase()} (${items.length} number${items.length > 1 ? 's' : ''}):*\n`;

        items.forEach((item, index) => {
            result += `${index + 1}. `;

            if (item.name) result += `*Name:* ${item.name}\n`;
            if (item.number) result += `   *Mobile:* ${item.number}\n`;
            if (item.cnic) result += `   *CNIC:* ${item.cnic}\n`;
            if (item.status || item.connection_status) result += `   *${item.status ? 'Status' : 'Connection Status'}:* ${item.status || item.connection_status}\n`;
            if (item.connection_type) result += `   *Connection Type:* ${item.connection_type}\n`;
            if (item.data_sim !== undefined) result += `   *Data SIM:* ${item.data_sim === 'Yes' || item.data_sim === true ? 'Yes' : 'No'}\n`;
            if (item.imsi) result += `   *IMSI:* ${item.imsi}\n`;
            if (item.address) result += `   *Address:* ${item.address}\n`;
            if (item.city) result += `   *City:* ${item.city}\n`;
            if (item.bvs_status) result += `   *BVS Status:* ${item.bvs_status}\n`;
            if (item.bvs_date) result += `   *BVS Date:* ${item.bvs_date}\n`;
            if (item.connection_date) result += `   *Connection Date:* ${item.connection_date}\n`;

            if (index < items.length - 1) result += `\n`;
        });

        result += `\n${'─'.repeat(35)}\n\n`;
    });

    result += `*Total Numbers Found:* ${results.length}\n`;
    result += `*Search Time:* ${timestamp}\n`;
    result += `${'─'.repeat(35)}\n`;
    result += `_Created by Sami Malik_`;

    return result;
}

export function extractCnicNumbers(results) {
    const cnicSet = new Set();

    if (Array.isArray(results)) {
        results.forEach(item => {
            if (item.cnic && item.cnic !== '' && item.cnic !== 'null') {
                cnicSet.add(item.cnic);
            }
        });
    }

    return Array.from(cnicSet);
}
