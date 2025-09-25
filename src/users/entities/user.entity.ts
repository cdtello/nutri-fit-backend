import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkoutDayEntity } from '../../workout-days/entities/workout-day.entity';
import { UserRole, UserStatus } from '../interfaces/user.interface';
import type { UserStats } from '../interfaces/user.interface';

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
   * 🎭 Rol del usuario en el sistema
   * Define los permisos y funcionalidades disponibles
   */
  @Column({ type: 'varchar', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  /**
   * 🖼️ URL de la foto de perfil (opcional)
   * Puede almacenar URL de imagen local o externa
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  /**
   * 📊 Estado del usuario
   * Define el estado actual del usuario en el sistema
   */
  @Column({ type: 'varchar', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  /**
   * 📝 Biografía/descripción del usuario (opcional)
   * Información adicional sobre el usuario
   */
  @Column({ type: 'text', nullable: true })
  bio?: string;

  /**
   * 📞 Número de teléfono (opcional)
   * Contacto telefónico del usuario
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  /**
   * 📍 Ubicación del usuario (opcional)
   * Ciudad, país o dirección del usuario
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  /**
   * 🎯 Especialidades del usuario (opcional)
   * Lista de áreas de especialización (para entrenadores/nutricionistas)
   */
  @Column({ type: 'simple-json', nullable: true })
  specialties?: string[];

  /**
   * 📈 Estadísticas del usuario (opcional)
   * Métricas de actividad y progreso del usuario
   */
  @Column({ type: 'simple-json', nullable: true })
  stats?: UserStats;

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
    this.role = this.role ?? UserRole.USER;
    this.status = this.status ?? UserStatus.ACTIVE;
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
   * 📅 Método para obtener la fecha de unión como string ISO
   * Convierte createdAt a formato ISO string para el frontend
   */
  getJoinedDate(): string {
    return this.createdAt.toISOString();
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
    this.status = UserStatus.ACTIVE;
    this.updateTimestamp();
  }

  /**
   * ❌ Método para desactivar el usuario (eliminación lógica)
   */
  deactivate(): void {
    this.status = UserStatus.INACTIVE;
    this.updateTimestamp();
  }

  /**
   * ⛔ Método para suspender el usuario
   */
  suspend(): void {
    this.status = UserStatus.SUSPENDED;
    this.updateTimestamp();
  }

  /**
   * 🚫 Método para banear el usuario
   */
  ban(): void {
    this.status = UserStatus.BANNED;
    this.updateTimestamp();
  }

  /**
   * 🔍 Método para verificar si el usuario está activo
   */
  isUserActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * 🎭 Método para verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * 🏋️ Método para verificar si el usuario es entrenador
   */
  isTrainer(): boolean {
    return this.role === UserRole.TRAINER;
  }

  /**
   * 🥗 Método para verificar si el usuario es nutricionista
   */
  isNutritionist(): boolean {
    return this.role === UserRole.NUTRITIONIST;
  }
}
