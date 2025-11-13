#!/bin/bash

# Script para cargar el jugador personalizado en la base de datos
# Ejecutar después de levantar Docker: ./scripts/seedCustomPlayer.sh

echo "🎮 Cargando jugador personalizado en la base de datos..."
echo ""

# Verificar que el contenedor de MySQL esté corriendo
if ! docker ps | grep -q soccer_stats_db; then
    echo "❌ Error: El contenedor de MySQL no está corriendo"
    echo "   Ejecuta primero: docker compose up -d"
    exit 1
fi

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
until docker exec soccer_stats_db mysql -u emmavd -pvangelis_genesis -e "SELECT 1" >/dev/null 2>&1; do
    echo "   MySQL aún no está listo, esperando..."
    sleep 2
done

echo "✅ MySQL está listo"
echo ""

# Ejecutar el seed
echo "📥 Insertando jugador personalizado (ID: 999999)..."
docker exec -i soccer_stats_db mysql -u emmavd -pvangelis_genesis soccers_stats < scripts/dump-data/03-custom-player-seed.sql 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Jugador personalizado cargado exitosamente!"
    echo ""
    echo "🔍 Verificando datos..."
    echo ""
    
    # Verificar en tabla players
    echo "📊 Datos en tabla FIFA players:"
    docker exec soccer_stats_db mysql -u emmavd -pvangelis_genesis soccers_stats -e "SELECT id, long_name, club_name, nationality_name, overall, potential FROM players WHERE id = 999999;" 2>/dev/null
    
    echo ""
    echo "📊 Datos en tabla Player (app):"
    docker exec soccer_stats_db mysql -u emmavd -pvangelis_genesis soccers_stats -e "SELECT id, short_name, long_name, nationality_id, dob FROM Player WHERE id = 999999;" 2>/dev/null
    
    echo ""
    echo "🎯 Puedes acceder al jugador en la API:"
    echo "   GET http://localhost:3000/api/fifa-players/999999"
    echo "   GET http://localhost:3000/api/fifa-players/search?q=Emma"
    echo ""
else
    echo ""
    echo "❌ Error al cargar el jugador"
    echo "   Revisa el archivo: scripts/dump-data/03-custom-player-seed.sql"
    exit 1
fi
