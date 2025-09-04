import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✨ Hace que esté disponible en toda la aplicación
      envFilePath: '.env', // 📄 Especifica el archivo de variables
    }),
    UsersModule, // 📦 Importar el módulo completo de usuarios
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
