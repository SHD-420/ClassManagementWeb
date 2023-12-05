import { dbClient } from "../index.ts";
import { Channel } from "./channel.ts";
import { User } from "./user.ts";

export type TextMessage = {
  id: number;
  content: string;
  createdAt: string;

  // Relationships
  userId: number;
  user: User;

  channelId: number;
  channel: Channel;
};

export const migrate = () =>
  dbClient.executeMultiple(`
        CREATE TABLE IF NOT EXISTS TEXT_MESSAGES (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CONTENT VARCHAR(255),
            USER_ID INTEGER REFERENCES USERS(ID) ON DELETE CASCADE NOT NULL,
            CHANNEL_ID INTEGER REFERENCES CHANNELS(ID) ON DELETE CASCADE NOT NULL,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
