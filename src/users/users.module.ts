import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserEntity } from './entities/user.entity';

/**
 * 📦 Módulo de usuarios
 * Agrupa toda la funcionalidad relacionada con usuarios:
 * - Controlador (manejo de HTTP requests)
 * - Servicio (lógica de negocio con Repository pattern)
 * - Entity (para interacción con base de datos)
 * - DTOs y interfaces (ya importados por controlador y servicio)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), // 🗄️ Registrar el repositorio de UserEntity
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta el servicio para ser usado en otros módulos
})
export class UsersModule {}
