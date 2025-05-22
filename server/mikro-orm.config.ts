import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import { User, Meeting, Transcript, Summary, ActionItem } from "@shared/schema";
import { Options } from "@mikro-orm/mongodb";

const config: Options = {
    // clientUrl: process.env.DATABASE_URL,
    clientUrl: "mongodb://dacn3:123qwe@18.143.164.143:27017/dacn3-bot",
    entities: [User, Meeting, Transcript, Summary, ActionItem],
    highlighter: new MongoHighlighter(),
    debug: process.env.NODE_ENV !== "production",
    dbName: "dacn3-bot",
    allowGlobalContext: false,
    contextName: "request",
};

export default config;
