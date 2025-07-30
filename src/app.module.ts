import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //Loads environment variables from the .env file.
    //Configures TypeORM asynchronously, pulling database settings from environment variables.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNC') === 'true',
        logging: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   password: '2077',
    //   username: 'postgres',
    //   entities: [],
    //   database: 'expense_tracker',
    //   synchronize: true,
    //   logging: true,
    // }),
  ],
})
export class AppModule {}
