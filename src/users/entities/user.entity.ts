import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkoutDayEntity } from '../../workout-days/entities/workout-day.entity';

/**
 * 🏛️ Entity de Usuario - Compatible con TypeORM
 * Representa la estructura de la tabla de usuarios en la base de datos
 * Esta clase define cómo se almacenan los datos en cualquier BD (SQLite, PostgreSQL, MySQL)
 */
@Entity('users') // 📋 Nombre de la tabla en la BD
export class UserEntity {
  /**
   * 🆔 Identificador único del usuario
   * Clave primaria, auto-incremental (funciona en SQLite, PostgreSQL, MySQL)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 📛 Nombre completo del usuario
   * Campo obligatorio, máximo 100 caracteres
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * 📧 Correo electrónico del usuario
   * Campo único y obligatorio, máximo 255 caracteres
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * 🎂 Edad del usuario
   * Campo obligatorio, rango válido: 0-150
   */
  @Column({ type: 'int' })
  age: number;

  /**
   * ✅ Estado activo del usuario
   * true = activo, false = inactivo/eliminado
   * Por defecto: true
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * 📅 Fecha de creación del registro
   * Se asigna automáticamente al crear el usuario
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 🔄 Fecha de última actualización
   * Se actualiza automáticamente al modificar el usuario
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 🏋️ Relación con los días de entrenamiento
   * Un usuario puede tener varios días de entrenamiento (One-to-Many)
   */
  @OneToMany(() => WorkoutDayEntity, (workoutDay) => workoutDay.user)
  workoutDays: WorkoutDayEntity[];

  /**
   * 🏗️ Constructor de la entity
   * Permite crear una instancia con valores iniciales
   */
  constructor(partial: Partial<UserEntity> = {}) {
    Object.assign(this, partial);

    // Valores por defecto si no se proporcionan
    this.isActive = this.isActive ?? true;
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
   * 📊 Método para calcular el grupo etario
   * Lógica de negocio que puede ser útil en la entity
   */
  getAgeGroup(): string {
    if (this.age < 18) return 'Menor de edad';
    if (this.age < 30) return 'Joven adulto';
    if (this.age < 50) return 'Adulto';
    if (this.age < 65) return 'Adulto mayor';
    return 'Tercera edad';
  }

  /**
   * 📛 Método para obtener el nombre formateado
   * Convierte el nombre a formato título (Primera Letra Mayúscula)
   */
  getDisplayName(): string {
    return this.name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * ✅ Método para activar el usuario
   */
  activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  /**
   * ❌ Método para desactivar el usuario (eliminación lógica)
   */
  deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  /**
   * 🔍 Método para verificar si el usuario está activo
   */
  isUserActive(): boolean {
    return this.isActive;
  }
}
