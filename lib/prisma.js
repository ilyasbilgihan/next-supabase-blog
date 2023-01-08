import { PrismaClient } from '@prisma/client';

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const serialize = (data) => {
  return JSON.parse(JSON.stringify(data));
}