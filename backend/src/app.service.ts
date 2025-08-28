import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database/database.module';

@Injectable()
export class AppService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  getHello(): string {
    return 'Welcome to Homezy API - Property Management Platform';
  }

  async getHealth() {
    let dbStatus = 'ok';
    let dbLatency = 0;

    try {
      const start = Date.now();
      await this.db.execute('SELECT 1');
      dbLatency = Date.now() - start;
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };
  }
}
