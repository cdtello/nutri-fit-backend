import { IsString, IsNumber, Min, Max, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 📝 DTO para crear un nuevo día de entrenamiento con validaciones automáticas
 * Define qué datos necesitamos para crear un día de entrenamiento
 */
export class CreateWorkoutDayDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string; // 📛 Nombre (obligatorio, string no vacío)

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string; // 📝 Descripción (opcional)

  @IsNumber({}, { message: 'El día de la semana debe ser un número' })
  @Min(1, { message: 'El día de la semana debe ser mayor o igual a 1 (Lunes)' })
  @Max(7, { message: 'El día de la semana debe ser menor o igual a 7 (Domingo)' })
  dayOfWeek: number; // 🗓️ Día de la semana (obligatorio, 1-7)

  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración debe ser mayor o igual a 1 minuto' })
  @Max(300, { message: 'La duración debe ser menor o igual a 300 minutos (5 horas)' })
  durationMinutes: number; // ⏱️ Duración (obligatorio, 1-300 minutos)

  @IsOptional()
  @IsNumber({}, { message: 'El nivel de intensidad debe ser un número' })
  @Min(1, { message: 'El nivel de intensidad debe ser mayor o igual a 1' })
  @Max(5, { message: 'El nivel de intensidad debe ser menor o igual a 5' })
  intensityLevel?: number; // 🔥 Intensidad (opcional, 1-5, default: 3)

  @IsOptional()
  @IsString({ message: 'El tipo de entrenamiento debe ser una cadena de texto' })
  @IsIn(['Fuerza', 'Cardio', 'Flexibilidad', 'Funcional', 'Mixto'], {
    message: 'El tipo de entrenamiento debe ser: Fuerza, Cardio, Flexibilidad, Funcional o Mixto'
  })
  workoutType?: string; // 🎯 Tipo (opcional, valores predefinidos, default: 'Fuerza')

  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  userId: number; // 👤 ID del usuario (obligatorio)
}

/**
 * ✏️ DTO para actualizar un día de entrenamiento existente con validaciones
 * Todos los campos son opcionales (puedes actualizar solo lo que quieras)
 */
export class UpdateWorkoutDayDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string; // 📛 Nombre (opcional)

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string; // 📝 Descripción (opcional)

  @IsOptional()
  @IsNumber({}, { message: 'El día de la semana debe ser un número' })
  @Min(1, { message: 'El día de la semana debe ser mayor o igual a 1 (Lunes)' })
  @Max(7, { message: 'El día de la semana debe ser menor o igual a 7 (Domingo)' })
  dayOfWeek?: number; // 🗓️ Día de la semana (opcional, 1-7)

  @IsOptional()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración debe ser mayor o igual a 1 minuto' })
  @Max(300, { message: 'La duración debe ser menor o igual a 300 minutos (5 horas)' })
  durationMinutes?: number; // ⏱️ Duración (opcional, 1-300 minutos)

  @IsOptional()
  @IsNumber({}, { message: 'El nivel de intensidad debe ser un número' })
  @Min(1, { message: 'El nivel de intensidad debe ser mayor o igual a 1' })
  @Max(5, { message: 'El nivel de intensidad debe ser menor o igual a 5' })
  intensityLevel?: number; // 🔥 Intensidad (opcional, 1-5)

  @IsOptional()
  @IsString({ message: 'El tipo de entrenamiento debe ser una cadena de texto' })
  @IsIn(['Fuerza', 'Cardio', 'Flexibilidad', 'Funcional', 'Mixto'], {
    message: 'El tipo de entrenamiento debe ser: Fuerza, Cardio, Flexibilidad, Funcional o Mixto'
  })
  workoutType?: string; // 🎯 Tipo (opcional, valores predefinidos)

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean; // ✅ Estado activo (opcional, debe ser booleano)
}

/**
 * 🔍 DTO para búsqueda de días de entrenamiento con validaciones
 * Define qué filtros podemos usar para buscar días de entrenamiento
 */
export class SearchWorkoutDayDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string; // 📛 Nombre (opcional, búsqueda parcial)

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El día de la semana debe ser un número' })
  @Min(1, { message: 'El día de la semana debe ser mayor o igual a 1 (Lunes)' })
  @Max(7, { message: 'El día de la semana debe ser menor o igual a 7 (Domingo)' })
  dayOfWeek?: number; // 🗓️ Día de la semana (opcional, se convierte automáticamente)

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración debe ser mayor o igual a 1 minuto' })
  @Max(300, { message: 'La duración debe ser menor o igual a 300 minutos' })
  durationMinutes?: number; // ⏱️ Duración (opcional, se convierte automáticamente)

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El nivel de intensidad debe ser un número' })
  @Min(1, { message: 'El nivel de intensidad debe ser mayor o igual a 1' })
  @Max(5, { message: 'El nivel de intensidad debe ser menor o igual a 5' })
  intensityLevel?: number; // 🔥 Intensidad (opcional, se convierte automáticamente)

  @IsOptional()
  @IsString({ message: 'El tipo de entrenamiento debe ser una cadena de texto' })
  @IsIn(['Fuerza', 'Cardio', 'Flexibilidad', 'Funcional', 'Mixto'], {
    message: 'El tipo de entrenamiento debe ser: Fuerza, Cardio, Flexibilidad, Funcional o Mixto'
  })
  workoutType?: string; // 🎯 Tipo (opcional, valores predefinidos)

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean; // ✅ Estado activo (opcional, se convierte automáticamente)

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  userId?: number; // 👤 ID del usuario (opcional, para filtrar por usuario)
}
