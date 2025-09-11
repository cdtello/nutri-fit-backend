import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✨ Hace que esté disponible en toda la aplicación
      envFilePath: '.env', // 📄 Especifica el archivo de variables
    }),

    // 🗄️ Configuración escalable de TypeORM (lee todo del .env)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbType = configService.get<string>('DB_TYPE') || 'sqlite';

        const baseConfig = {
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: configService.get('DB_LOGGING') === 'true',
          entities: [UserEntity],
        };

        // Para SQLite solo necesitamos el archivo de base de datos
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('DB_DATABASE') || './nutri-fit.db',
            ...baseConfig,
          };
        } else {
          // Para otras BD (PostgreSQL, MySQL, MariaDB) necesitamos conexión de red
          return {
            type: dbType as 'postgres' | 'mysql' | 'mariadb',
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: parseInt(configService.get<string>('DB_PORT') as string),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            ...baseConfig,
          } as TypeOrmModuleOptions;
        }
      },
      inject: [ConfigService],
    }),

    UsersModule, // 📦 Importar el módulo completo de usuarios
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
