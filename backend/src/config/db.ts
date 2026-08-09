import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(cs: string) {
  try {
    const parsed = new URL(cs);
    return {
      host: parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, "").split("?")[0],
      connectionLimit: 10,
    };
  } catch (err) {
    const str = cs.replace(/^mysql:\/\//, "");
    const lastAtIndex = str.lastIndexOf("@");
    const userPass = str.substring(0, lastAtIndex);
    const hostDb = str.substring(lastAtIndex + 1);
    const colonIndex = userPass.indexOf(":");
    const user = userPass.substring(0, colonIndex);
    const password = decodeURIComponent(userPass.substring(colonIndex + 1));
    const [hostPort, dbAndQuery] = hostDb.split("/");
    const [host, port] = hostPort.split(":");
    const database = (dbAndQuery || "").split("?")[0];
    const resolvedHost = host === "localhost" ? "127.0.0.1" : host;
    return { host: resolvedHost, port: parseInt(port) || 3306, user, password, database, connectionLimit: 10 };
  }
}

const dbUrl = process.env.DATABASE_URL || "mysql://root:root@127.0.0.1:3306/FundRooms";
const dbConfig = parseDatabaseUrl(dbUrl);

const adapter = new PrismaMariaDb(dbConfig);

export const prisma = new PrismaClient({ adapter });