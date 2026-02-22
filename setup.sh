#!/bin/bash

echo "🚀 Arsan Professional Auto Setup Starting..."

############################################
# CONFIG
############################################

MODULES=("auth" "companies" "users" "catalog" "vehicles" "orders" "notifications" "search")

############################################
# BACKEND SETUP (NestJS)
############################################

if [ ! -f backend/package.json ]; then

  echo "📦 Creating NestJS backend..."

  cd backend || exit

  npx @nestjs/cli new temp-backend --skip-git --package-manager npm

  # copy scaffold safely
  cp -r temp-backend/. .

  rm -rf temp-backend

  cd ..
else
  echo "✅ Backend exists — skipping scaffold"
fi

############################################
# CLEAN ARCHITECTURE STRUCTURE
############################################

echo "🧱 Building Clean Architecture modules..."

for module in "${MODULES[@]}"; do

  BASE="backend/src/modules/$module"

  mkdir -p "$BASE/api/controllers"
  mkdir -p "$BASE/api/dto"

  mkdir -p "$BASE/application/services"
  mkdir -p "$BASE/application/use-cases"

  mkdir -p "$BASE/domain/entities"
  mkdir -p "$BASE/domain/interfaces"
  mkdir -p "$BASE/domain/enums"

  mkdir -p "$BASE/infrastructure/repositories"
  mkdir -p "$BASE/infrastructure/integrations"

done

############################################
# COMMON STRUCTURE (TENANT + CORE)
############################################

mkdir -p backend/src/common/guards
mkdir -p backend/src/common/interceptors
mkdir -p backend/src/common/filters
mkdir -p backend/src/common/decorators
mkdir -p backend/src/common/tenant

############################################
# FRONTEND SETUP (NextJS)
############################################

if [ ! -f frontend/package.json ]; then

  echo "🎨 Creating NextJS frontend..."

  cd frontend || exit

  npx create-next-app@latest . --ts --eslint --app --src-dir --no-tailwind --yes

  cd ..
else
  echo "✅ Frontend exists — skipping scaffold"
fi

############################################
# PHASE LOCK (ARCHITECTURE ENFORCEMENT)
############################################

if [ ! -f PHASE.lock ]; then
  echo "PHASE_1_SCAFFOLD_ONLY" > PHASE.lock
fi

echo "🔒 Current phase:"
cat PHASE.lock

############################################
# INSTALL BACKEND DEPENDENCIES (SAFE)
############################################

if [ -f backend/package.json ]; then
  echo "📦 Installing backend dependencies..."
  cd backend || exit
  npm install
  cd ..
fi

############################################
# DONE
############################################

echo "✅ Arsan scaffold complete."
