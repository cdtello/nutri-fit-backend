import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutDaysController } from './controllers/workout-days.controller';
import { WorkoutDaysService } from './services/workout-days.service';
import { WorkoutDayEntity } from './entities/workout-day.entity';
import { UserEntity } from '../users/entities/user.entity';

/**
 * 📦 Módulo de días de entrenamiento
 * Agrupa toda la funcionalidad relacionada con días de entrenamiento:
 * - Controlador (manejo de HTTP requests)
 * - Servicio (lógica de negocio con Repository pattern)
 * - Entity (para interacción con base de datos)
 * - DTOs y interfaces (ya importados por controlador y servicio)
 * - Relación con UserEntity para validaciones y referencias
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutDayEntity, UserEntity]), // 🗄️ Registrar los repositorios necesarios
  ],
  controllers: [WorkoutDaysController],
  providers: [WorkoutDaysService],
  exports: [WorkoutDaysService], // Exporta el servicio para ser usado en otros módulos
})
export class WorkoutDaysModule {}
