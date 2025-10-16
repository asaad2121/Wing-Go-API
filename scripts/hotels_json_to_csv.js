const fs = require('fs');
const path = require('path');

const input = require('./hotels.json');
const outputRows = [];

for (const element of input.elements || []) {
    const tags = element.tags || {};

    const buildAddress = (tags) => {
        const houseNumber = tags['addr:housenumber'] || '';
        const street = tags['addr:street'] || '';
        const suburb = tags['addr:suburb'] || '';
        const postcode = tags['addr:postcode'] || '';

        // Combine parts intelligently
        const line1 = [houseNumber, street]?.filter(Boolean)?.join(' ');
        const line2 = [suburb, postcode]?.filter(Boolean)?.join(', ');

        return [line1, line2].filter(Boolean).join(', ');
    };

    const addressFields = buildAddress(tags);

    outputRows.push({
        hotel_name: tags.name || '',
        email: tags.email || '',
        rating: (Math.random() * 5).toFixed(1),
        city: tags['addr:city'] || '',
        latitude: element.lat || '',
        longitude: element.lon || '',
        address: addressFields || '',
        contact_no: tags.phone || '',
    });
}

const header = Object.keys(outputRows[0]);
const csvContent = [
    header.join(','),
    ...outputRows.map((row) => header.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
].join('\n');

fs.writeFileSync(path.join(__dirname, 'hotels.csv'), csvContent);
console.log('CSV written to hotels.csv');
