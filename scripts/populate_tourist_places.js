const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
const { City, TouristPlace, sequelize } = require('../models');

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

async function getPlaceInfoFromCoordinates(lat, lon) {
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}`;
        const response = await axios.get(url);
        const features = response.data.features;
        if (features && features.length > 0) {
            const place = features[0];
            const address = place.place_name || null;

            // Mapbox doesn't have a consistent field for website, but sometimes
            // it's in place.properties.website or in place.context
            let website = null;

            if (place.properties && place.properties.website) {
                website = place.properties.website;
            } else if (place.context) {
                // Sometimes website info can be in context items (less common)
                for (const ctx of place.context) {
                    if (ctx.id.startsWith('website.') && ctx.text) {
                        website = ctx.text;
                        break;
                    }
                }
            }

            return { address, website };
        }
        return { address: null, website: null };
    } catch (err) {
        console.error('Error fetching place info from Mapbox:', err.message);
        return { address: null, website: null };
    }
}

async function processCSV() {
    const csvFilePath = path.join(__dirname, 'tourist_places.csv');
    const fileStream = fs.createReadStream(csvFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let headerSkipped = false;

    for await (const line of rl) {
        if (!headerSkipped) {
            headerSkipped = true; // skip CSV header
            continue;
        }

        // CSV columns: city,place,latitude,longitude,description
        const [cityName, placeName, latStr, lonStr, description] = line.split(',');

        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lonStr);

        if (!cityName || !placeName || isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Skipping invalid line: ${line}`);
            continue;
        }

        // Find cityId from city table
        const city = await City.findOne({ where: { name: cityName.trim() } });
        if (!city) {
            console.warn(`City not found: ${cityName}`);
            continue;
        }

        // Get address and website via Mapbox reverse geocoding
        const { address, website } = await getPlaceInfoFromCoordinates(latitude, longitude);

        // Insert into tourist_places
        await TouristPlace.create({
            name: placeName.trim(),
            cityId: city.id,
            latitude,
            longitude,
            website,
            description: description ? description.trim() : null,
            address: address || null,
        });

        console.log(`Inserted: ${placeName} in city ${cityName}`);
    }
}

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connection established');

        await processCSV();

        console.log('Done populating tourist_places');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
