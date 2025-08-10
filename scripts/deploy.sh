#!/bin/bash

echo "Starting deployment initialization..."

# Run database migrations
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Seed the database with initial data if needed
echo "Seeding database..."
npx tsx prisma/seed-automated.ts || echo "Seeding failed or database already seeded"

echo "Starting the application..."
npm start