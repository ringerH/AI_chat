export async function createConversation(client: any): Promise<string> {
    const res = await client.query(
      "INSERT INTO conversations DEFAULT VALUES RETURNING id"
    );
    return res.rows[0].id;
  }
  