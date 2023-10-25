import "$std/dotenv/load.ts";
import { getUserByEmail } from "./db/models/user.ts";

console.log(await getUserByEmail("32.shivangdubey@gmail.com"))