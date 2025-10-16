const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const inputFilePath = path.join(__dirname, 'hotels.csv');
const outputFilePath = path.join(__dirname, 'enriched_hotels.csv');

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const getMapboxData = async (lat, lon) => {
    try {
        const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json`, {
            params: {
                access_token: MAPBOX_TOKEN,
                types: 'place,locality,address',
            },
        });

        const features = res.data.features;
        const city = features.find((f) => f.place_type.includes('place'))?.text || '';
        const address = features[0]?.place_name || '';

        return { city, address };
    } catch (err) {
        console.error(`Mapbox error for (${lat}, ${lon}):`, err.message);
        return { city: '', address: '' };
    }
};

const enrichHotels = async () => {
    const hotels = [];

    fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
            hotels.push(row);
        })
        .on('end', async () => {
            console.log(`🔍 Loaded ${hotels.length} hotels from CSV...`);

            for (let hotel of hotels) {
                const needsCity = !hotel.city?.trim();
                const needsAddress = !hotel.address?.trim();

                if ((needsCity || needsAddress) && hotel.latitude && hotel.longitude) {
                    const { city, address } = await getMapboxData(hotel.latitude, hotel.longitude);
                    if (needsCity) hotel.city = city;
                    if (needsAddress) hotel.address = address;
                    console.log(`Enriched: ${hotel.hotel_name}`);
                }
            }

            // Prepare CSV writer
            const csvWriter = createCsvWriter({
                path: outputFilePath,
                header: Object.keys(hotels[0]).map((key) => ({ id: key, title: key })),
            });

            await csvWriter.writeRecords(hotels);
            console.log(`Enriched CSV saved to ${outputFilePath}`);
        });
};

enrichHotels();
