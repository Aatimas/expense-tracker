import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: '2077',
      username: 'postgres',
      entities: [],
      database: 'expense-tracker',
      synchronize: true,
      logging: true,
    }),
  ],
})
export class AppModule {}
