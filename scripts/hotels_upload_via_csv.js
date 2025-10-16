const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const models = require('../models');
require('dotenv').config();

const csvPath = path.join(__dirname, 'enriched_hotels.csv');

const uploadToDatabase = async () => {
    const hotels = [];

    fs.createReadStream(csvPath)
        .pipe(
            csv({
                mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim(),
            })
        )
        .on('data', (row) => {
            hotels.push(row);
        })
        .on('end', async () => {
            console.log(`📥 Processing ${hotels.length} rows...`);

            for (const hotel of hotels) {
                try {
                    const name = hotel['hotel_name']?.trim();
                    const rating = parseFloat(hotel.rating);

                    // Generate price based on rating (e.g. 3.0 = $180–220, 4.5 = $270–350)
                    let pricePerNight = null;

                    if (!isNaN(rating)) {
                        const base = 100 + rating * 50;
                        const randomOffset = Math.floor(Math.random() * 41) - 20;
                        pricePerNight = (base + randomOffset).toFixed(2);
                    }

                    await models.Hotels.create({
                        name,
                        city: hotel.city?.trim(),
                        latitude: parseFloat(hotel.latitude) || null,
                        longitude: parseFloat(hotel.longitude) || null,
                        rating,
                        pricePerNight: pricePerNight || null,
                        address: hotel.address?.trim(),
                        contactNo: hotel.contact_no?.trim(),
                        email: hotel.email?.trim(),
                    });

                    console.log(`Inserted: ${name} - $${pricePerNight}`);
                } catch (err) {
                    console.error(`Failed for ${hotel.hotel_name}:`, err.message);
                }
            }

            console.log('All data uploaded to DB');
            process.exit(0);
        });
};

uploadToDatabase();
