#!/bin/sh

# Script de inicialização para API

echo "Iniciando API..."

# Aguardar banco de dados estar disponível
echo "Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL disponível!"

# Iniciar aplicação Node.js
echo "Iniciando servidor Node.js..."
exec npm start
