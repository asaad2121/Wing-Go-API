const fs = require('fs');
const path = require('path');
const { City } = require('../models');
const sequelize = require('../models').sequelize;

const cities = [
    { city: 'Auckland' },
    { city: 'Bombay' },
    { city: 'Cambridge' },
    { city: 'Dairy Flat' },
    { city: 'Dannevirke' },
    { city: 'Drury' },
    { city: 'Edgecumbe' },
    { city: 'Eltham' },
    { city: 'Havelock North' },
    { city: 'Hāwera' },
    { city: 'Helensville' },
    { city: 'Huntly' },
    { city: 'Inglewood' },
    { city: 'Kaiaua' },
    { city: 'Karaka' },
    { city: 'Karapiro' },
    { city: 'Kaukapakapa' },
    { city: 'Kotemaori' },
    { city: 'Mangakino' },
    { city: 'Morrinsville' },
    { city: 'Mount Maunganui' },
    { city: 'Mourea' },
    { city: 'Napier' },
    { city: 'New Plymouth' },
    { city: 'Ngāruawāhia' },
    { city: 'Ohakune' },
    { city: 'Ōhope' },
    { city: 'Ohope Beach' },
    { city: 'Opunake' },
    { city: 'Orewa' },
    { city: 'Ōtāne' },
    { city: 'Ōwhango' },
    { city: 'Palmerston North' },
    { city: 'Papakura' },
    { city: 'Pātea' },
    { city: 'Pirongia' },
    { city: 'Raetihi' },
    { city: 'Raglan' },
    { city: 'Rotorua' },
    { city: 'Stratford' },
    { city: 'Taihape' },
    { city: 'Taumarunui' },
    { city: 'Taupō' },
    { city: 'Tauranga' },
    { city: 'Te Aroha' },
    { city: 'Te Awamutu' },
    { city: 'Te Kaha' },
    { city: 'Tikokino' },
    { city: 'Tīrau' },
    { city: 'Tūrangi' },
    { city: 'Urenui' },
    { city: 'Waiheke Island' },
    { city: 'Waihi' },
    { city: 'Waihi Beach' },
    { city: 'Waikaretu' },
    { city: 'Waimarino' },
    { city: 'Waipukurau' },
    { city: 'Wairoa' },
    { city: 'Waverley' },
    { city: 'Whakatāne' },
    { city: 'Whanganui' },
    { city: 'Whangaparāoa' },
    { city: 'Whitianga' },
    { city: 'Woodville' },
];

(async () => {
    try {
        await sequelize.sync();

        await City.bulkCreate(
            cities.map((c) => ({ name: c.city })),
            { ignoreDuplicates: true }
        );

        console.log('Cities inserted successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to insert cities:', err);
        process.exit(1);
    }
})();
