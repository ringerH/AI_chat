export async function createMessage(
    client: any,
    conversationId: string,
    text: string
  ): Promise<void> {
    await client.query(
      `INSERT INTO messages (conversation_id, sender, text)
       VALUES ($1, 'user', $2)`,
      [conversationId, text]
    );
  }
  
  export async function getMessagesByConversation(
    client: any,
    conversationId: string
  ) {
    const res = await client.query(
      `SELECT id, sender, text, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
  
    return res.rows;
  }
  
  export async function insertUserMessage(
    client: any,
    conversationId: string,
    text: string,
    clientMessageId: string
  ) {
    const res = await client.query(
      `
      INSERT INTO messages (conversation_id, sender, text, client_message_id)
      VALUES ($1, 'user', $2, $3)
      ON CONFLICT (conversation_id, client_message_id)
      WHERE client_message_id IS NOT NULL
      DO NOTHING
      RETURNING id
      `,
      [conversationId, text, clientMessageId]
    );
  
    return res.rows[0]?.id;
  }
  
  
  export async function insertAssistantPlaceholder(
    client: any,
    conversationId: string,
    replyTo: string
  ) {
    const res = await client.query(
      `INSERT INTO messages (conversation_id, sender, status, reply_to)
       VALUES ($1, 'assistant', 'pending', $2)
       RETURNING id`,
      [conversationId, replyTo]
    );
    return res.rows[0].id;
  }
  
  export async function completeAssistantMessage(
    client: any,
    messageId: string,
    text: string
  ) {
    await client.query(
      `UPDATE messages
       SET text = $1, status = 'completed'
       WHERE id = $2`,
      [text, messageId]
    );
  }
  
  export async function failAssistantMessage(
    client: any,
    messageId: string,
    error: string
  ) {
    await client.query(
      `UPDATE messages
       SET status = 'failed', error = $1
       WHERE id = $2`,
      [error, messageId]
    );
  }
  