#!/bin/sh

echo "⏳ Esperando a PostgreSQL..."

# Esperar a que la DB responda
until nc -z postgres 5432; do
  sleep 1
done

echo "✅ PostgreSQL listo"

echo "🚀 Ejecutando migraciones..."
yarn migration:run

echo "🔥 Iniciando app..."
node dist/main.js