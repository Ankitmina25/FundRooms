import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(cs: string) {
  const str = cs.replace(/^mysql:\/\//, "");
  const lastAtIndex = str.lastIndexOf("@");
  const userPass = str.substring(0, lastAtIndex);
  const hostDb = str.substring(lastAtIndex + 1);
  const colonIndex = userPass.indexOf(":");
  const user = userPass.substring(0, colonIndex);
  const password = decodeURIComponent(userPass.substring(colonIndex + 1));
  const [hostPort, database] = hostDb.split("/");
  const [host, port] = hostPort.split(":");
  
  // Use 127.0.0.1 for localhost to ensure IPv4 connection
  const resolvedHost = host === "localhost" ? "127.0.0.1" : host;
  
  return { host: resolvedHost, port: parseInt(port) || 3306, user, password, database };
}

const dbConfig = parseDatabaseUrl(
  process.env.DATABASE_URL || "mysql://root:root@127.0.0.1:3306/FundRooms"
);

const adapter = new PrismaMariaDb(dbConfig);

export const prisma = new PrismaClient({ adapter });