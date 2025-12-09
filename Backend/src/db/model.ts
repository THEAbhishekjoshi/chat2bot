import dotenv from "dotenv"
dotenv.config()

import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.POSTGRES_STRING
})

console.log("connection string:", process.env.POSTGRES_STRING)

// Create table

// --- USERS---
export default async function createUserTable() {
    console.log('---Database Connected---')

    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      role VARCHAR(255) NOT NULL,
      message_id VARCHAR(255),
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

    console.log('Users table ensured.')
}


export async function createMemoryTable() {
    //FOREIGN KEY (user_id) REFERENCES  users(user_id)
    await pool.query(`
    CREATE TABLE IF NOT EXISTS memory (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL UNIQUE,
      summarize_text TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

    console.log('Memory table ensured.');
}

//
export async function updateResponseId({ responseId }: { responseId: string }) {
  try {
    const query = `
      SELECT created_at FROM users
      WHERE message_id = $1
    `;
    const createdAtResult = await pool.query(query, [responseId]);

    
    if (createdAtResult.rows.length === 0) {
      console.log("No record found with this message_id");
      return;
    }

    const createdAtValue = createdAtResult.rows[0].created_at;

    
    const query2 = `
      DELETE FROM users
      WHERE created_at >= $1
    `;
    const result = await pool.query(query2, [createdAtValue]);

    console.log("Deleted rows:", result.rowCount);
  } catch (error) {
    console.log("error while updating db", error);
  }
}
updateResponseId({responseId:"first"})

// Fetch last 10 messages
export async function getLastMessages({ userId }: { userId: string }) {
    try {
        const query = `
      SELECT * FROM users
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;

        const result = await pool.query(query, [userId])
        console.log("Last 10 messages(from db)-->", result.rows)
        return result.rows

    } catch (error) {
        console.error('Error during fetching messages', error);
    }
}

// fetch all messages of that user
export async function allUserMessages({ userId }: { userId: string }) {
    try {
        const query = `
        SELECT * FROM users
        WHERE user_id =$1
        ORDER BY created_at ASC;
        `
        const result = await pool.query(query, [userId])
        // return result.rows

        let messages = '';
        for (let rows of result.rows) {
            if (rows.role == 'user') {
                messages += rows.content + "\n"
            }
        }
        return messages;
    }
    catch (error) {
        console.log('Error during fetching all user messages', error)
    }
}

export interface savedMessagesProps {
    userId: string;
    role: string;
    content: string;
    messageId?:string;
}

// Store message
export async function storeMessages({ userId, role, content,messageId}: savedMessagesProps) {
    try {
        const storeQuery = `
      INSERT INTO users (user_id, role, content,message_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

        const values = [userId, role, content,messageId || ""];
        const result = await pool.query(storeQuery, values)

        console.log('Inserted message:', result.rows[0])
    } catch (error) {
        console.log('Error during storing the message', error)
    }
}

export interface summarizeMessagesProps {
    userId: string,
    summarizeText: string
}

// store summarize test
export async function storeSummarizeMessages({ userId, summarizeText }: summarizeMessagesProps) {
    try {
        const storeQuery = `
        INSERT INTO memory (user_id, summarize_text, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
        summarize_text = EXCLUDED.summarize_text,
        updated_at = NOW()
        RETURNING *;
        `;

        const values = [userId, summarizeText]
        const result = await pool.query(storeQuery, values)
        console.log('Inserted summarized-message:', result.rows[0])
    } catch (error) {
        console.log('Error during storing the summarized message', error)
    }
}
