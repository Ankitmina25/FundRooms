import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(cs: string) {
  let parsedHost = "127.0.0.1";
  let parsedPort = 3306;
  let parsedUser = "root";
  let parsedPassword = "";
  let parsedDatabase = "FundRooms";

  try {
    const parsed = new URL(cs);
    parsedHost = parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname;
    parsedPort = parsed.port ? parseInt(parsed.port, 10) : 3306;
    parsedUser = decodeURIComponent(parsed.username);
    parsedPassword = decodeURIComponent(parsed.password);
    parsedDatabase = parsed.pathname.replace(/^\//, "").split("?")[0];
  } catch (err) {
    const str = cs.replace(/^mysql:\/\//, "");
    const lastAtIndex = str.lastIndexOf("@");
    const userPass = str.substring(0, lastAtIndex);
    const hostDb = str.substring(lastAtIndex + 1);
    const colonIndex = userPass.indexOf(":");
    parsedUser = userPass.substring(0, colonIndex);
    parsedPassword = decodeURIComponent(userPass.substring(colonIndex + 1));
    const [hostPort, dbAndQuery] = hostDb.split("/");
    const [host, port] = hostPort.split(":");
    parsedDatabase = (dbAndQuery || "").split("?")[0];
    parsedHost = host === "localhost" ? "127.0.0.1" : host;
    parsedPort = parseInt(port) || 3306;
  }

  const host = process.env.MYSQLHOST || parsedHost;
  const port = Number(process.env.MYSQLPORT) || parsedPort;
  const user = process.env.MYSQLUSER || parsedUser;
  const password = process.env.MYSQLPASSWORD || parsedPassword;
  const database = process.env.MYSQLDATABASE || parsedDatabase;

  return { host, port, user, password, database, connectionLimit: 10 };
}

const dbUrl = process.env.DATABASE_URL || process.env.MYSQLURL || "mysql://root:root@127.0.0.1:3306/FundRooms";
const dbConfig = parseDatabaseUrl(dbUrl);

console.log(`[DB Config] Host: ${dbConfig.host}:${dbConfig.port}, Database: ${dbConfig.database}, User: ${dbConfig.user}`);

const adapter = new PrismaMariaDb(dbConfig);

export const prisma = new PrismaClient({ adapter });