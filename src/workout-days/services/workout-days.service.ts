import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { WorkoutDayEntity } from '../entities/workout-day.entity';
import { CreateWorkoutDayDto, UpdateWorkoutDayDto, SearchWorkoutDayDto } from '../dto/workout-day.dto';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * 🏋️ Servicio de días de entrenamiento - Lógica de negocio con Base de Datos
 *
 * Este servicio maneja toda la lógica relacionada con los días de entrenamiento.
 * Incluye operaciones CRUD y validaciones de negocio específicas.
 * Usa TypeORM Repository pattern para persistencia escalable.
 * Compatible con SQLite, PostgreSQL, MySQL, etc.
 *
 * @class WorkoutDaysService
 * @description Gestiona entrenamientos semanales de usuarios
 */
@Injectable()
export class WorkoutDaysService {
  /**
   * Constructor del servicio
   * @param workoutDayRepository - Repositorio para WorkoutDayEntity
   * @param userRepository - Repositorio para validar usuarios
   */
  constructor(
    @InjectRepository(WorkoutDayEntity)
    private readonly workoutDayRepository: Repository<WorkoutDayEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 📋 Obtener todos los días de entrenamiento activos desde la BD
   *
   * Obtiene todos los entrenamientos activos ordenados por día de la semana.
   * Solo devuelve entrenamientos con isActive = true.
   *
   * @returns {Promise<WorkoutDayEntity[]>} Lista de entrenamientos activos
   * @example
   * const entrenamientos = await workoutDaysService.findAll();
   * entrenamientos.forEach(e => console.log(`${e.name} - ${e.getDayName()}`));
   */
  async findAll(): Promise<WorkoutDayEntity[]> {
    console.log('📋 Obteniendo días de entrenamiento activos desde la base de datos...');

    return await this.workoutDayRepository.find({
      where: { isActive: true },
      order: { dayOfWeek: 'ASC', createdAt: 'DESC' }, // Por día de semana, luego más recientes
    });
  }

  /**
   * 👤 Obtener todos los días de entrenamiento de un usuario específico
   *
   * Filtra los entrenamientos por usuario y los devuelve ordenados por día.
   * Valida que el usuario exista antes de buscar sus entrenamientos.
   *
   * @param {number} userId - ID del usuario propietario
   * @returns {Promise<WorkoutDayEntity[]>} Entrenamientos del usuario ordenados por día
   * @throws {NotFoundException} Si el usuario no existe o no está activo
   *
   * @example
   * const entrenamientosUsuario = await workoutDaysService.findByUserId(1);
   * console.log(`Usuario tiene ${entrenamientosUsuario.length} días de entrenamiento`);
   */
  async findByUserId(userId: number): Promise<WorkoutDayEntity[]> {
    console.log(`👤 Obteniendo días de entrenamiento del usuario ${userId}...`);

    // Validar que el usuario existe y está activo
    await this.validateUserExists(userId);

    return await this.workoutDayRepository.find({
      where: { userId, isActive: true },
      order: { dayOfWeek: 'ASC' }, // Lunes a Domingo
    });
  }

  /**
   * 🔍 Buscar días de entrenamiento con filtros en la BD
   *
   * Permite búsquedas avanzadas combinando múltiples criterios.
   * Los filtros se aplican de forma dinámica según los parámetros proporcionados.
   *
   * @param {SearchWorkoutDayDto} searchWorkoutDayDto - Criterios de búsqueda
   * @returns {Promise<WorkoutDayEntity[]>} Entrenamientos que cumplen los criterios
   *
   * @example
   * // Buscar entrenamientos de cardio
   * const cardio = await workoutDaysService.search({ workoutType: 'Cardio' });
   *
   * // Buscar entrenamientos de un día específico
   * const lunes = await workoutDaysService.search({ dayOfWeek: 1 });
   *
   * // Búsqueda combinada
   * const intensos = await workoutDaysService.search({
   *   intensityLevel: 5,
   *   workoutType: 'Fuerza'
   * });
   */
  async search(searchWorkoutDayDto: SearchWorkoutDayDto): Promise<WorkoutDayEntity[]> {
    console.log('🔍 Buscando días de entrenamiento con filtros en la BD:', searchWorkoutDayDto);

    // Construir condiciones WHERE dinámicamente
    const whereConditions: Record<string, any> = {};

    // Filtrar por nombre (búsqueda parcial)
    if (searchWorkoutDayDto.name) {
      whereConditions.name = Like(`%${searchWorkoutDayDto.name}%`);
    }

    // Filtrar por día de la semana (1=Lunes, 7=Domingo)
    if (searchWorkoutDayDto.dayOfWeek) {
      whereConditions.dayOfWeek = searchWorkoutDayDto.dayOfWeek;
    }

    // Filtrar por duración exacta en minutos
    if (searchWorkoutDayDto.durationMinutes) {
      whereConditions.durationMinutes = searchWorkoutDayDto.durationMinutes;
    }

    // Filtrar por nivel de intensidad (1-5)
    if (searchWorkoutDayDto.intensityLevel) {
      whereConditions.intensityLevel = searchWorkoutDayDto.intensityLevel;
    }

    // Filtrar por tipo de entrenamiento
    if (searchWorkoutDayDto.workoutType) {
      whereConditions.workoutType = searchWorkoutDayDto.workoutType;
    }

    // Filtrar por estado activo
    if (searchWorkoutDayDto.isActive !== undefined) {
      whereConditions.isActive = searchWorkoutDayDto.isActive;
    }

    // Filtrar por usuario propietario
    if (searchWorkoutDayDto.userId) {
      whereConditions.userId = searchWorkoutDayDto.userId;
    }

    return await this.workoutDayRepository.find({
      where: whereConditions,
      order: { dayOfWeek: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 🏋️ Obtener un día de entrenamiento por ID desde la BD
   *
   * Busca un entrenamiento específico por su ID único.
   * Útil para obtener detalles completos de un entrenamiento.
   *
   * @param {number} id - ID único del día de entrenamiento
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento encontrado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el entrenamiento no existe
   *
   * @example
   * const entrenamiento = await workoutDaysService.findOne(1);
   * console.log(entrenamiento.name); // 'Lunes - Pecho y Tríceps'
   * console.log(entrenamiento.getIntensityDescription()); // 'Intensidad Alta'
   */
  async findOne(id: number): Promise<WorkoutDayEntity> {
    console.log(`🔍 Buscando día de entrenamiento con ID: ${id} en la BD`);

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const workoutDay = await this.workoutDayRepository.findOne({
      where: { id },
    });

    if (!workoutDay) {
      throw new NotFoundException(`Día de entrenamiento con ID ${id} no encontrado`);
    }

    return workoutDay;
  }

  /**
   * ➕ Crear un nuevo día de entrenamiento en la BD
   *
   * Crea un entrenamiento después de validar que:
   * 1. El usuario exista y esté activo
   * 2. No haya otro entrenamiento activo para ese día de la semana
   *
   * @param {CreateWorkoutDayDto} createWorkoutDayDto - Datos del nuevo entrenamiento
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento recién creado
   * @throws {NotFoundException} Si el usuario no existe o no está activo
   * @throws {ConflictException} Si ya existe un entrenamiento para ese día
   *
   * @example
   * const nuevoEntrenamiento = await workoutDaysService.create({
   *   name: 'Jueves - Espalda y Bíceps',
   *   description: 'Rutina de espalda con dominadas',
   *   dayOfWeek: 4,
   *   durationMinutes: 80,
   *   intensityLevel: 4,
   *   workoutType: 'Fuerza',
   *   userId: 1
   * });
   */
  async create(createWorkoutDayDto: CreateWorkoutDayDto): Promise<WorkoutDayEntity> {
    console.log('➕ Creando nuevo día de entrenamiento en la BD:', createWorkoutDayDto);

    // Validar que el usuario existe y está activo
    await this.validateUserExists(createWorkoutDayDto.userId);

    // Validar que no exista ya un entrenamiento para ese usuario en ese día
    const existingWorkout = await this.workoutDayRepository.findOne({
      where: {
        userId: createWorkoutDayDto.userId,
        dayOfWeek: createWorkoutDayDto.dayOfWeek,
        isActive: true,
      },
    });

    if (existingWorkout) {
      const dayName = this.getDayName(createWorkoutDayDto.dayOfWeek);
      throw new ConflictException(`Ya existe un entrenamiento activo para el ${dayName}`);
    }

    // Crear el nuevo entrenamiento con valores por defecto
    const workoutDay = this.workoutDayRepository.create({
      name: createWorkoutDayDto.name.trim(),
      description: createWorkoutDayDto.description?.trim(),
      dayOfWeek: createWorkoutDayDto.dayOfWeek,
      durationMinutes: createWorkoutDayDto.durationMinutes,
      intensityLevel: createWorkoutDayDto.intensityLevel ?? 3, // Medio por defecto
      workoutType: createWorkoutDayDto.workoutType ?? 'Fuerza', // Fuerza por defecto
      userId: createWorkoutDayDto.userId,
      isActive: true,
    });

    const savedWorkoutDay = await this.workoutDayRepository.save(workoutDay);
    console.log('✅ Día de entrenamiento creado exitosamente en la BD:', savedWorkoutDay);

    return savedWorkoutDay;
  }

  /**
   * ✏️ Actualizar un día de entrenamiento existente en la BD
   *
   * Actualiza solo los campos proporcionados (actualización parcial).
   * Si se cambia el día de la semana, valida que no haya conflictos.
   *
   * @param {number} id - ID del entrenamiento a actualizar
   * @param {UpdateWorkoutDayDto} updateWorkoutDayDto - Campos a actualizar
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento actualizado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el entrenamiento no existe
   * @throws {ConflictException} Si el nuevo día ya tiene otro entrenamiento
   *
   * @example
   * // Cambiar solo la duración
   * const entrenamiento = await workoutDaysService.update(1, { durationMinutes: 100 });
   *
   * // Cambiar múltiples campos
   * const entrenamiento = await workoutDaysService.update(1, {
   *   name: 'Lunes - Entrenamiento Actualizado',
   *   intensityLevel: 5,
   *   durationMinutes: 120
   * });
   */
  async update(id: number, updateWorkoutDayDto: UpdateWorkoutDayDto): Promise<WorkoutDayEntity> {
    console.log(`✏️ Actualizando día de entrenamiento ID ${id} en la BD:`, updateWorkoutDayDto);

    // Validar que el ID sea válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    // Buscar el entrenamiento a actualizar
    const workoutDay = await this.workoutDayRepository.findOne({
      where: { id },
    });

    if (!workoutDay) {
      throw new NotFoundException(`Día de entrenamiento con ID ${id} no encontrado`);
    }

    // Validar conflicto de día de semana solo si se está cambiando
    if (updateWorkoutDayDto.dayOfWeek && updateWorkoutDayDto.dayOfWeek !== workoutDay.dayOfWeek) {
      const existingWorkout = await this.workoutDayRepository.findOne({
        where: {
          userId: workoutDay.userId,
          dayOfWeek: updateWorkoutDayDto.dayOfWeek,
          isActive: true,
        },
      });

      if (existingWorkout && existingWorkout.id !== id) {
        const dayName = this.getDayName(updateWorkoutDayDto.dayOfWeek);
        throw new ConflictException(`Ya existe otro entrenamiento activo para el ${dayName}`);
      }
    }

    // Actualizar solo los campos proporcionados
    if (updateWorkoutDayDto.name) workoutDay.name = updateWorkoutDayDto.name.trim();
    if (updateWorkoutDayDto.description !== undefined) workoutDay.description = updateWorkoutDayDto.description?.trim();
    if (updateWorkoutDayDto.dayOfWeek !== undefined) workoutDay.dayOfWeek = updateWorkoutDayDto.dayOfWeek;
    if (updateWorkoutDayDto.durationMinutes !== undefined) workoutDay.durationMinutes = updateWorkoutDayDto.durationMinutes;
    if (updateWorkoutDayDto.intensityLevel !== undefined) workoutDay.intensityLevel = updateWorkoutDayDto.intensityLevel;
    if (updateWorkoutDayDto.workoutType !== undefined) workoutDay.workoutType = updateWorkoutDayDto.workoutType;
    if (updateWorkoutDayDto.isActive !== undefined) workoutDay.isActive = updateWorkoutDayDto.isActive;

    const updatedWorkoutDay = await this.workoutDayRepository.save(workoutDay);
    console.log('✅ Día de entrenamiento actualizado exitosamente en la BD:', updatedWorkoutDay);

    return updatedWorkoutDay;
  }

  /**
   * 🗑️ Eliminar un día de entrenamiento (eliminación lógica) en la BD
   *
   * Realiza eliminación lógica cambiando isActive a false.
   * No elimina físicamente el registro (soft delete).
   * Permite recuperar el entrenamiento más tarde si es necesario.
   *
   * @param {number} id - ID del entrenamiento a eliminar
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento marcado como eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el entrenamiento no existe
   * @throws {ConflictException} Si el entrenamiento ya estaba eliminado
   *
   * @example
   * const entrenamientoEliminado = await workoutDaysService.remove(1);
   * console.log(entrenamientoEliminado.isActive); // false
   *
   * // Para reactivar:
   * await workoutDaysService.update(1, { isActive: true });
   */
  async remove(id: number): Promise<WorkoutDayEntity> {
    console.log(`🗑️ Eliminando día de entrenamiento ID ${id} en la BD`);

    // Validar que el ID sea válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const workoutDay = await this.workoutDayRepository.findOne({
      where: { id },
    });

    if (!workoutDay) {
      throw new NotFoundException(`Día de entrenamiento con ID ${id} no encontrado`);
    }

    if (!workoutDay.isActive) {
      throw new ConflictException(`Día de entrenamiento con ID ${id} ya estaba eliminado`);
    }

    // Eliminación lógica: cambiar isActive a false
    workoutDay.isActive = false;
    const deletedWorkoutDay = await this.workoutDayRepository.save(workoutDay);

    console.log('✅ Día de entrenamiento eliminado exitosamente en la BD:', deletedWorkoutDay);
    return deletedWorkoutDay;
  }

  /**
   * 👤 Método privado para validar que un usuario existe y está activo
   *
   * Verifica en la BD que el usuario exista y tenga isActive = true.
   * Se usa antes de crear o modificar entrenamientos.
   *
   * @param {number} userId - ID del usuario a validar
   * @throws {NotFoundException} Si el usuario no existe o no está activo
   * @private
   */
  private async validateUserExists(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado o no está activo`);
    }
  }

  /**
   * 📅 Método privado para obtener el nombre del día de la semana
   *
   * Convierte el número de día (1-7) a su nombre en español.
   * Útil para mensajes de error y logs legibles.
   *
   * @param {number} dayNumber - Número del día (1=Lunes, 7=Domingo)
   * @returns {string} Nombre del día en español
   * @private
   *
   * @example
   * this.getDayName(1); // 'Lunes'
   * this.getDayName(7); // 'Domingo'
   * this.getDayName(8); // 'Día inválido'
   */
  private getDayName(dayNumber: number): string {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[dayNumber] || 'Día inválido';
  }
}
