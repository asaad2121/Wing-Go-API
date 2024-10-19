# Wing-Go-API

## Updating the Models (e.g., "Users")

After updating your models, follow these steps to create and apply migrations:

1. **Generate a Migration**  
    Run the following command to create a new migration file:
    ```bash
    npm run create-migration update-users-schema

2. **Update the Migration File
    Open the newly created migration file and make the necessary adjustments to reflect your model changes.

3. Run the migration
    ```bash
    npm run migrate
