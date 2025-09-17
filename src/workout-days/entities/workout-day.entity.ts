import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * 🏋️ Entity de Día de Entrenamiento - Compatible con TypeORM
 * Representa la estructura de la tabla de días de entrenamiento en la base de datos
 * Esta clase define cómo se almacenan los datos en cualquier BD (SQLite, PostgreSQL, MySQL)
 */
@Entity('workout_days') // 📋 Nombre de la tabla en la BD
export class WorkoutDayEntity {
  /**
   * 🆔 Identificador único del día de entrenamiento
   * Clave primaria, auto-incremental (funciona en SQLite, PostgreSQL, MySQL)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 📛 Nombre del día de entrenamiento
   * Campo obligatorio, máximo 100 caracteres
   * Ejemplos: "Lunes - Pecho y Tríceps", "Miércoles - Piernas", "Cardio Intenso"
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * 📝 Descripción detallada del entrenamiento
   * Campo opcional, texto largo para describir ejercicios y rutinas
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * 🗓️ Día de la semana (1=Lunes, 2=Martes, ..., 7=Domingo)
   * Campo obligatorio, rango válido: 1-7
   */
  @Column({ type: 'int' })
  dayOfWeek: number;

  /**
   * ⏱️ Duración estimada del entrenamiento en minutos
   * Campo obligatorio, rango válido: 1-300 minutos (5 horas máx)
   */
  @Column({ type: 'int' })
  durationMinutes: number;

  /**
   * 🔥 Nivel de intensidad del entrenamiento
   * 1 = Bajo, 2 = Moderado, 3 = Alto, 4 = Muy Alto, 5 = Extremo
   */
  @Column({ type: 'int', default: 3 })
  intensityLevel: number;

  /**
   * 🎯 Tipo de entrenamiento
   * Ejemplos: "Fuerza", "Cardio", "Flexibilidad", "Funcional", "Mixto"
   */
  @Column({ type: 'varchar', length: 50, default: 'Fuerza' })
  workoutType: string;

  /**
   * ✅ Estado activo del día de entrenamiento
   * true = activo, false = inactivo/eliminado
   * Por defecto: true
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * 👤 Relación con el usuario propietario
   * Un día de entrenamiento pertenece a un usuario (Many-to-One)
   */
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 🔗 ID del usuario propietario (clave foránea)
   * Campo obligatorio para establecer la relación
   */
  @Column({ name: 'user_id' })
  userId: number;

  /**
   * 📅 Fecha de creación del registro
   * Se asigna automáticamente al crear el día de entrenamiento
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 🔄 Fecha de última actualización
   * Se actualiza automáticamente al modificar el día de entrenamiento
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 🏗️ Constructor de la entity
   * Permite crear una instancia con valores iniciales
   */
  constructor(partial: Partial<WorkoutDayEntity> = {}) {
    Object.assign(this, partial);

    // Valores por defecto si no se proporcionan
    this.isActive = this.isActive ?? true;
    this.intensityLevel = this.intensityLevel ?? 3;
    this.workoutType = this.workoutType ?? 'Fuerza';
    this.createdAt = this.createdAt ?? new Date();
    this.updatedAt = this.updatedAt ?? new Date();
  }

  /**
   * 🔄 Método para actualizar la fecha de modificación
   * Se debe llamar antes de guardar cambios
   */
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  /**
   * 📊 Método para obtener el nombre del día de la semana
   * Convierte el número a nombre legible
   */
  getDayName(): string {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[this.dayOfWeek] || 'Día inválido';
  }

  /**
   * 🎯 Método para obtener el nivel de intensidad en texto
   * Convierte el número a descripción legible
   */
  getIntensityName(): string {
    const levels = ['', 'Bajo', 'Moderado', 'Alto', 'Muy Alto', 'Extremo'];
    return levels[this.intensityLevel] || 'Intensidad inválida';
  }

  /**
   * ⏱️ Método para obtener la duración formateada
   * Convierte minutos a formato "Xh Ym" o "Ym"
   */
  getFormattedDuration(): string {
    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  /**
   * 🔍 Método para verificar si es un entrenamiento largo
   * Considera largo si es mayor a 90 minutos
   */
  isLongWorkout(): boolean {
    return this.durationMinutes > 90;
  }

  /**
   * ✅ Método para activar el día de entrenamiento
   */
  activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  /**
   * ❌ Método para desactivar el día de entrenamiento (eliminación lógica)
   */
  deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  /**
   * 🔍 Método para verificar si el día de entrenamiento está activo
   */
  isWorkoutActive(): boolean {
    return this.isActive;
  }
}
