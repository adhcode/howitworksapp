import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        
        if (!connectionString) {
          throw new Error('DATABASE_URL environment variable is required');
        }

        // Create postgres client with SSL support
        const client = postgres(connectionString, {
          max: 10, // Connection pool size
          ssl: configService.get<string>('DB_SSL') === 'false' ? false : { rejectUnauthorized: false },
        });

        // Create and return drizzle instance
        const db = drizzle(client, { schema });

        return db;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
