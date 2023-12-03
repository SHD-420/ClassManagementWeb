import { dbClient } from "../index.ts";

export type MediaMessage = {
  type: "img" | "vdo" | "pdf";
};

export const migrate = () =>
  dbClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS MEDIA_MESSAGES (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        TYPE CHAR(3) NOT NULL,
        LABEL VARCHAR(255) DEFAULT "",
        PREVIEW_IMG_PATH VARCHAR(32) NOT NULL,
        FILE_PATH VARCHAR(32) NOT NULL,
        USER_ID INTEGER REFERENCES USERS(ID) ON DELETE CASCADE NOT NULL,
        CHANNEL_ID INTEGER REFERENCES CHANNELS(ID) ON DELETE CASCADE NOT NULL,
    )
`);
