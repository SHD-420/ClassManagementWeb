import { dbClient } from "../index.ts";
import { Channel } from "./channel.ts";
import { User } from "./user.ts";

export type ChannelUserPivot = {
  createdAt: string;

  // relationships
  channelId: number;
  channel: Channel;

  userId: number;
  user: User;
};

export const migrate = () =>
  dbClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS CHANNEL_USER_PIVOTS (
        USER_ID INTEGER REFERENCES USERS(ID) ON DELETE CASCADE NOT NULL,
        CHANNEL_ID INTEGER REFERENCES CHANNELS(ID) ON DELETE CASCADE NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (USER_ID, CHANNEL_ID) ON CONFLICT REPLACE
    );
`);
