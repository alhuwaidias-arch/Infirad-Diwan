#!/bin/bash
# ديوان المعرفة - Database Setup Script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_NAME="${DB_NAME:-diwan_maarifa}"
DB_USER="${DB_USER:-diwan_admin}"
DB_PASSWORD="${DB_PASSWORD:-change_this_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${GREEN}ديوان المعرفة - Database Setup${NC}"

if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed"
    exit 1
fi

echo -e "${YELLOW}Creating database user...${NC}"
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

echo -e "${YELLOW}Creating database...${NC}"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo -e "${YELLOW}Granting privileges...${NC}"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo -e "${YELLOW}Creating schema...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema/01_create_tables.sql

echo -e "${GREEN}✓ Database setup completed!${NC}"
echo "Connection: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
