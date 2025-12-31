CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    sender TEXT NOT NULL
        CHECK (sender IN ('user', 'assistant')),

    text TEXT,

    status TEXT
        CHECK (status IN ('accepted', 'pending', 'completed', 'failed')),

    error TEXT,

    reply_to UUID
        REFERENCES messages(id)
        ON DELETE SET NULL,

    client_message_id TEXT,

    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_client_msg_per_convo
ON messages (conversation_id, client_message_id)
WHERE client_message_id IS NOT NULL;
