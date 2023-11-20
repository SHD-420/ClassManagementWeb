import { dbClient } from "../index.ts";
import { Channel } from "./channel.ts";
import { User } from "./user.ts";

export type JoinRequest = {
  createdAt: string;

  // relationships
  channelId: number;
  channel: Channel;

  userId: number;
  user: User;
};

export const migrate = () =>
  dbClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS JOIN_REQUESTS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USER_ID INTEGER REFERENCES USERS(ID) ON DELETE CASCADE NOT NULL,
        CHANNEL_ID INTEGER REFERENCES CHANNELS(ID) ON DELETE CASCADE NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

/** Insert a new join request into the database */
export const createJoinRequest = async (
  data: Pick<JoinRequest, "channelId" | "userId">,
) => {
  await dbClient.execute({
    sql: `INSERT INTO JOIN_REQUESTS (USER_ID, CHANNEL_ID) VALUES (?, ?)`,
    args: [data.userId, data.channelId],
  });
};
