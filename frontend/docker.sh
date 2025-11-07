#!/bin/bash

# Docker Helper Script for Soccer Stats
# Este script facilita las operaciones comunes de Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

function help() {
    echo "Soccer Stats - Docker Helper"
    echo ""
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start         - Iniciar todos los servicios"
    echo "  stop          - Detener todos los servicios"
    echo "  restart       - Reiniciar todos los servicios"
    echo "  build         - Reconstruir las imágenes"
    echo "  logs          - Ver logs de todos los servicios"
    echo "  logs-frontend - Ver logs del frontend"
    echo "  logs-backend  - Ver logs del backend"
    echo "  logs-db       - Ver logs de la base de datos"
    echo "  clean         - Limpiar contenedores y volúmenes"
    echo "  reset         - Reset completo (limpia todo y reconstruye)"
    echo "  status        - Ver estado de los servicios"
    echo "  shell-frontend - Abrir shell en el contenedor frontend"
    echo "  shell-backend  - Abrir shell en el contenedor backend"
    echo "  shell-db       - Abrir psql en la base de datos"
    echo "  help          - Mostrar esta ayuda"
}

function start() {
    print_info "Iniciando servicios..."
    docker-compose up -d
    print_success "Servicios iniciados"
    status
}

function stop() {
    print_info "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

function restart() {
    print_info "Reiniciando servicios..."
    docker-compose restart
    print_success "Servicios reiniciados"
    status
}

function build() {
    print_info "Reconstruyendo imágenes..."
    docker-compose build --no-cache
    print_success "Imágenes reconstruidas"
}

function logs() {
    docker-compose logs -f
}

function logs_service() {
    docker-compose logs -f "$1"
}

function clean() {
    print_info "Limpiando contenedores y volúmenes..."
    docker-compose down -v
    print_success "Limpieza completada"
}

function reset() {
    print_info "Realizando reset completo..."
    docker-compose down -v
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Reset completado"
    status
}

function status() {
    print_info "Estado de los servicios:"
    docker-compose ps
}

function shell_frontend() {
    print_info "Abriendo shell en el contenedor frontend..."
    docker-compose exec frontend sh
}

function shell_backend() {
    print_info "Abriendo shell en el contenedor backend..."
    docker-compose exec backend sh
}

function shell_db() {
    print_info "Abriendo psql en la base de datos..."
    docker-compose exec db psql -U postgres -d soccer_stats
}

# Main script logic
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    build)
        build
        ;;
    logs)
        logs
        ;;
    logs-frontend)
        logs_service "frontend"
        ;;
    logs-backend)
        logs_service "backend"
        ;;
    logs-db)
        logs_service "db"
        ;;
    clean)
        clean
        ;;
    reset)
        reset
        ;;
    status)
        status
        ;;
    shell-frontend)
        shell_frontend
        ;;
    shell-backend)
        shell_backend
        ;;
    shell-db)
        shell_db
        ;;
    help|"")
        help
        ;;
    *)
        print_error "Comando desconocido: $1"
        echo ""
        help
        exit 1
        ;;
esac
