# Wing-Go-API

This API serves as the backend for the WingGo Travel Guide application. It provides endpoints for user authentication, hotels, tourist destinations, trip planning, and city data.

---

## Updating the Models (e.g., "Users")

After modifying or adding fields to your Sequelize models, follow these steps to create and apply migrations:

1. **Generate a Migration**  
   Run the following command to create a new migration file. Replace `update-users-schema` with a descriptive name for your migration:

    ```bash
    npm run create-migration update-users-schema
    ```

2. **Update the Migration File**  
   Open the newly created migration file (located in the `migrations/` folder) and modify it to reflect the changes made in your model. Typically, this includes adding, removing, or altering columns.

3. **Run the Migration**  
   Apply the migration to your database with:

    ```bash
     npm run migrate
    ```

    Ensure that your environment variables for database connection (`.env`) are correctly set for the target environment (development, test, or production).

---

## Running the API

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Set Environment Variables**
   Create a `.env` file with the following variables:

    ```bash
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    DB_DATABASE=your_database
    DB_HOST=your_db_host
    DB_DIALECT=mysql
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    REACT_APP=your_frontend_url
    ```

3. **Start the Server**
    ```bash
    npm run dev
    ```

The server will start on the port specified in your `.env` file (default 2139).

---

## API Endpoints Overview

- **User Authentication:**  
- `POST /users/login` - Login user, returns JWT in HttpOnly cookie  
- `POST /users/signup` - Register new user  
- `GET /auth/google` - Google OAuth login  
- `GET /auth/google/callback` - Google OAuth callback  

- **Hotels API:**  
- `GET /hotel/getTopHotels`  
- `GET /hotel/getHotelsByCity/:cityId`  
- `GET /hotel/:hotelId`  

- **Tourist Places API:**  
- `GET /tourist-place/getTouristPlacesForTopCities`  
- `GET /tourist-place/:id`  

- **Trip Planner API:**  
- `POST /trips/plan`  

- **City API:**  
- `GET /city/getAllCities`  

- **Protected Example Route:**  
- `GET /protected-route`  

All endpoints that require user-specific access are secured using JWT tokens stored in HTTP-only cookies.

---

## Notes

- Always test migrations on a development database before running in production.  
- Use Postman or similar tools to verify endpoints and authentication flows.  
- For any changes to images, ensure Cloudinary credentials are correct and images are uploaded properly.
