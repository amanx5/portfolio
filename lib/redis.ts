import "server-only";
import { Redis } from "@upstash/redis";

// one client shared by every Redis user in the app
export const redis = Redis.fromEnv();
