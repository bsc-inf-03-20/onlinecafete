import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

const databaseUrl =
  process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/onlinecafete';

@Module({
  imports: [
    MongooseModule.forRoot(databaseUrl),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'docs'),
      serveRoot: '/docs',
    }),
    AuthModule,
    UsersModule,
    MenuModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
