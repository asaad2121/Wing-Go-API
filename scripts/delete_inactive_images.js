const cloudinary = require('cloudinary').v2;
const models = require('../models');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function deleteInactiveImages(model, modelName) {
  console.log(`Fetching inactive ${modelName} images...`);
  const inactiveImages = await model.findAll({
    where: { isActive: false },
  });

  if (inactiveImages.length === 0) {
    console.log(`No inactive ${modelName} images found.`);
    return;
  }

  console.log(`Found ${inactiveImages.length} inactive ${modelName} images. Deleting...`);

  for (const image of inactiveImages) {
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(image.imagePublicId);
      console.log(`🗑️ Deleted from Cloudinary: ${image.imagePublicId}`);

      // Delete from DB
      await image.destroy();
      console.log(`Deleted from DB: ID ${image.id}`);
    } catch (err) {
      console.error(`Failed to delete image ID ${image.id} (${image.imagePublicId}):`, err.message);
    }
  }

  console.log(`Finished deleting inactive ${modelName} images.`);
}

async function main() {
  try {
    await deleteInactiveImages(models.HotelImages, 'hotel');
    await deleteInactiveImages(models.TouristPlaceImages, 'tourist place');
  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    process.exit();
  }
}

main();