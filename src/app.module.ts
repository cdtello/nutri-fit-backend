import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✨ Hace que esté disponible en toda la aplicación
      envFilePath: '.env', // 📄 Especifica el archivo de variables
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
