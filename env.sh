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
CRESTFALL_SECRET=$(openssl rand 32)
CRESTFALL_HEX_SECRET=$(echo -n "$CRESTFALL_SECRET" | xxd -p -c 32)
CRESTFALL_BASE32_SECRET=$(echo -n "$CRESTFALL_SECRET" | base32)
CRESTFALL_BASE64_SECRET=$(echo -n "$CRESTFALL_SECRET" | base64)

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
