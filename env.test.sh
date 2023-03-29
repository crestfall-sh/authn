#!/bin/bash

CRESTFALL_ENVIRONMENT="$1"

if [ -z "$CRESTFALL_ENVIRONMENT" ]; then
    CRESTFALL_ENVIRONMENT="development"
fi

echo "--> Removing .env file symlink."
rm -f ./dependencies/.env

echo "--> Removing .env file."
rm -f ./.env

echo "--> Creating .env file."
CRESTFALL_ENVIRONMENT="development"
CRESTFALL_HEX_SECRET="e092db4b85d44530c8c5023aff645dc39a44903b91c708d167a87486c471b889"
CRESTFALL_BASE32_SECRET="4CJNWS4F2RCTBSGFAI5P6ZC5YONEJEB3SHDQRULHVB2INRDRXCEQ===="
CRESTFALL_BASE64_SECRET="4JLbS4XURTDIxQI6/2Rdw5pEkDuRxwjRZ6h0hsRxuIk="

# Crestfall
echo "CRESTFALL_ENVIRONMENT=$CRESTFALL_ENVIRONMENT" >> .env
echo "CRESTFALL_HEX_SECRET=$CRESTFALL_HEX_SECRET" >> .env
echo "CRESTFALL_BASE32_SECRET=$CRESTFALL_BASE32_SECRET" >> .env
echo "CRESTFALL_BASE64_SECRET=$CRESTFALL_BASE64_SECRET" >> .env

# PostgreSQL
echo "POSTGRES_USER=postgres" >> .env
echo "POSTGRES_PASSWORD=$CRESTFALL_HEX_SECRET" >> .env

# PostgREST
echo "PGRST_DB_SCHEMAS=public,private" >> .env
echo "PGRST_DB_EXTRA_SEARCH_PATH=public" >> .env
echo "PGRST_JWT_SECRET=$CRESTFALL_BASE64_SECRET" >> .env
echo "PGRST_JWT_SECRET_IS_BASE64=true" >> .env

echo "--> Reading .env file."
cat ./.env

echo "--> Creating .env file symlink."
ln ./.env ./dependencies/.env
