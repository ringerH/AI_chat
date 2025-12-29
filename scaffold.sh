#!/usr/bin/env bash
set -e

mkdir -p backend/src

mkdir -p backend/src/api/routes
mkdir -p backend/src/api/validators

mkdir -p backend/src/domain

mkdir -p backend/src/persistence/repositories
mkdir -p backend/src/persistence/schema

mkdir -p backend/src/services

mkdir -p backend/src/infra

touch backend/src/app.ts

touch backend/src/api/routes/chat.ts
touch backend/src/api/validators/message.ts
touch backend/src/api/httpErrors.ts

touch backend/src/domain/conversation.ts
touch backend/src/domain/message.ts
touch backend/src/domain/states.ts
touch backend/src/domain/errors.ts

touch backend/src/persistence/repositories/conversationRepo.ts
touch backend/src/persistence/repositories/messageRepo.ts
touch backend/src/persistence/transactions.ts

touch backend/src/infra/db.ts
touch backend/src/infra/env.ts
touch backend/src/infra/logger.ts
