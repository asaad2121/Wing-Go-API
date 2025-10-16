// node scripts/tourist_place_images_generation.js --start=60

const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const models = require('../models');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const FALLBACK_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const ERROR_LOG_PATH = path.join(__dirname, 'tourist_image_upload_errors.log');

const args = process.argv.slice(2);
const startIndex = parseInt(args.find((arg) => arg.startsWith('--start='))?.split('=')[1] || '0');
const batchSize = 20;

const generatePublicId = (name, index) =>
    `${name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase()}_${index}`;

const getImagesFromGoogle = async (query, count = 5) => {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                q: query,
                cx: process.env.GOOGLE_SEARCH_CSE,
                key: process.env.GOOGLE_SEARCH_API_KEY,
                searchType: 'image',
                num: count,
                imgSize: 'xlarge',
            },
        });

        const items = response.data.items || [];
        return items.map((item) => item.link).filter(Boolean);
    } catch (err) {
        console.error(`Google fetch failed for "${query}" →`, err.response?.data?.error?.message || err.message);
        return [];
    }
};

const uploadImageToCloudinary = async (imageUrl, publicId) => {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: 'tourist_places',
            public_id: publicId,
            overwrite: true,
            transformation: { width: 800, crop: 'scale' },
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
        };
    } catch (err) {
        console.error(`Cloudinary upload failed for "${publicId}" →`, err.message);
        return null;
    }
};

const seedTouristPlaceImages = async () => {
    const places = await models.TouristPlace.findAll({ order: [['id', 'ASC']] });
    const slice = places.slice(startIndex, startIndex + batchSize);
    console.log(`🚀 Processing tourist places ${startIndex + 1} to ${startIndex + slice.length}`);

    for (const place of slice) {
        const query = `${place.name} tourist attraction`;
        const images = await getImagesFromGoogle(query, 5);
        const imagesToUpload = images.length > 0 ? images : [FALLBACK_IMAGE_URL];

        for (let i = 0; i < imagesToUpload.length; i++) {
            const imageUrl = imagesToUpload[i];
            const publicId = generatePublicId(place.name, i + 1);

            console.log(`📷 Uploading image ${i + 1} for ${place.name}`);

            const cloudData = await uploadImageToCloudinary(imageUrl, publicId);
            if (!cloudData) {
                fs.appendFileSync(ERROR_LOG_PATH, `${place.name} | ${imageUrl} | Upload Failed\n`);
                continue;
            }

            try {
                await models.TouristPlaceImages.create({
                    touristPlaceId: place.id,
                    imagePublicId: cloudData.public_id,
                    format: cloudData.format,
                });

                console.log(`Image ${i + 1} saved for ${place.name}`);
            } catch (dbErr) {
                fs.appendFileSync(ERROR_LOG_PATH, `${place.name} | ${cloudData.url} | DB Insert Failed\n`);
                console.error(`DB insert failed for ${place.name} →`, dbErr.message);
            }
        }
    }

    console.log('Tourist place image batch upload complete');
};

seedTouristPlaceImages();
