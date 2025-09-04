import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

/**
 * 📦 Módulo de usuarios
 * Agrupa toda la funcionalidad relacionada con usuarios:
 * - Controlador (manejo de HTTP requests)
 * - Servicio (lógica de negocio)
 * - DTOs y interfaces (ya importados por controlador y servicio)
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta el servicio para ser usado en otros módulos
})
export class UsersModule {}
