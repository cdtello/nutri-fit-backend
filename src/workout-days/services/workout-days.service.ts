import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { WorkoutDay } from '../interfaces/workout-day.interface';
import { WorkoutDayEntity } from '../entities/workout-day.entity';
import { CreateWorkoutDayDto, UpdateWorkoutDayDto, SearchWorkoutDayDto } from '../dto/workout-day.dto';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * 🏋️ Servicio de días de entrenamiento - Lógica de negocio con Base de Datos
 * Ahora usa TypeORM Repository pattern para persistencia escalable
 * Compatible con SQLite, PostgreSQL, MySQL, etc.
 */
@Injectable()
export class WorkoutDaysService {
  constructor(
    @InjectRepository(WorkoutDayEntity)
    private readonly workoutDayRepository: Repository<WorkoutDayEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    void this.seedInitialData(); // 🌱 Crear datos iniciales si no existen
  }

  /**
   * 🌱 Crear datos iniciales en la BD (solo si está vacía)
   * Se ejecuta automáticamente al iniciar la aplicación
   */
  private async seedInitialData(): Promise<void> {
    const count = await this.workoutDayRepository.count();

    if (count === 0) {
      console.log('🌱 Sembrando datos iniciales de entrenamientos en la base de datos...');

      // Verificar que existan usuarios para asociar los entrenamientos
      const users = await this.userRepository.find({ where: { isActive: true } });

      if (users.length === 0) {
        console.log('⚠️ No hay usuarios activos, saltando seed de entrenamientos');
        return;
      }

      const initialWorkoutDays = [
        {
          name: 'Lunes - Pecho y Tríceps',
          description: 'Entrenamiento de fuerza enfocado en pecho, hombros y tríceps. Incluye press de banca, flexiones y extensiones.',
          dayOfWeek: 1,
          durationMinutes: 90,
          intensityLevel: 4,
          workoutType: 'Fuerza',
          isActive: true,
          userId: users[0].id,
        },
        {
          name: 'Miércoles - Piernas',
          description: 'Rutina completa de piernas: sentadillas, peso muerto, extensiones y curl de piernas.',
          dayOfWeek: 3,
          durationMinutes: 75,
          intensityLevel: 5,
          workoutType: 'Fuerza',
          isActive: true,
          userId: users[0].id,
        },
        {
          name: 'Viernes - Cardio Intenso',
          description: 'Sesión de cardio de alta intensidad con intervalos. Incluye correr, burpees y saltos.',
          dayOfWeek: 5,
          durationMinutes: 45,
          intensityLevel: 4,
          workoutType: 'Cardio',
          isActive: true,
          userId: users[0].id,
        },
        {
          name: 'Martes - Yoga y Flexibilidad',
          description: 'Sesión de yoga para mejorar flexibilidad y relajación. Enfoque en posturas y respiración.',
          dayOfWeek: 2,
          durationMinutes: 60,
          intensityLevel: 2,
          workoutType: 'Flexibilidad',
          isActive: true,
          userId: users.length > 1 ? users[1].id : users[0].id,
        },
      ];

      for (const workoutData of initialWorkoutDays) {
        const workout = this.workoutDayRepository.create(workoutData);
        await this.workoutDayRepository.save(workout);
      }

      console.log('✅ Datos iniciales de entrenamientos creados exitosamente');
    }
  }

  /**
   * 📋 Obtener todos los días de entrenamiento activos desde la BD
   * @returns {Promise<WorkoutDay[]>} Lista de días de entrenamiento activos solamente
   */
  async findAll(): Promise<WorkoutDay[]> {
    console.log('📋 Obteniendo días de entrenamiento activos desde la base de datos...');

    const workoutDays = await this.workoutDayRepository.find({
      where: { isActive: true },
      order: { dayOfWeek: 'ASC', createdAt: 'DESC' }, // Ordenar por día de semana, luego por más recientes
    });

    return this.mapEntitiesToInterfaces(workoutDays);
  }

  /**
   * 👤 Obtener todos los días de entrenamiento de un usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise<WorkoutDay[]>} Lista de días de entrenamiento del usuario
   */
  async findByUserId(userId: number): Promise<WorkoutDay[]> {
    console.log(`👤 Obteniendo días de entrenamiento del usuario ${userId}...`);

    // Validar que el usuario existe
    await this.validateUserExists(userId);

    const workoutDays = await this.workoutDayRepository.find({
      where: { userId, isActive: true },
      order: { dayOfWeek: 'ASC' },
    });

    return this.mapEntitiesToInterfaces(workoutDays);
  }

  /**
   * 🔍 Buscar días de entrenamiento con filtros en la BD
   * @param {SearchWorkoutDayDto} searchWorkoutDayDto - Filtros de búsqueda
   * @returns {Promise<WorkoutDay[]>} Lista de días de entrenamiento filtrados
   */
  async search(searchWorkoutDayDto: SearchWorkoutDayDto): Promise<WorkoutDay[]> {
    console.log('🔍 Buscando días de entrenamiento con filtros en la BD:', searchWorkoutDayDto);

    const whereConditions: Record<string, any> = {};

    // Filtrar por nombre (búsqueda parcial)
    if (searchWorkoutDayDto.name) {
      whereConditions.name = Like(`%${searchWorkoutDayDto.name}%`);
    }

    // Filtrar por día de la semana
    if (searchWorkoutDayDto.dayOfWeek) {
      whereConditions.dayOfWeek = searchWorkoutDayDto.dayOfWeek;
    }

    // Filtrar por duración
    if (searchWorkoutDayDto.durationMinutes) {
      whereConditions.durationMinutes = searchWorkoutDayDto.durationMinutes;
    }

    // Filtrar por nivel de intensidad
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

    // Filtrar por usuario
    if (searchWorkoutDayDto.userId) {
      whereConditions.userId = searchWorkoutDayDto.userId;
    }

    const workoutDays = await this.workoutDayRepository.find({
      where: whereConditions,
      order: { dayOfWeek: 'ASC', createdAt: 'DESC' },
    });

    return this.mapEntitiesToInterfaces(workoutDays);
  }

  /**
   * 🏋️ Obtener un día de entrenamiento por ID desde la BD
   * @param {number} id - ID del día de entrenamiento
   * @returns {Promise<WorkoutDay>} Día de entrenamiento encontrado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el día de entrenamiento no existe
   */
  async findOne(id: number): Promise<WorkoutDay> {
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

    return this.mapEntityToInterface(workoutDay);
  }

  /**
   * ➕ Crear un nuevo día de entrenamiento en la BD
   * @param {CreateWorkoutDayDto} createWorkoutDayDto - Datos del nuevo día de entrenamiento
   * @returns {Promise<WorkoutDay>} Día de entrenamiento creado
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si ya existe un entrenamiento para ese usuario en ese día
   */
  async create(createWorkoutDayDto: CreateWorkoutDayDto): Promise<WorkoutDay> {
    console.log('➕ Creando nuevo día de entrenamiento en la BD:', createWorkoutDayDto);

    // Validar que el usuario existe
    await this.validateUserExists(createWorkoutDayDto.userId);

    // Validar que no exista ya un entrenamiento para ese usuario en ese día de la semana
    const existingWorkout = await this.workoutDayRepository.findOne({
      where: {
        userId: createWorkoutDayDto.userId,
        dayOfWeek: createWorkoutDayDto.dayOfWeek,
        isActive: true
      },
    });

    if (existingWorkout) {
      const dayName = this.getDayName(createWorkoutDayDto.dayOfWeek);
      throw new ConflictException(`Ya existe un entrenamiento activo para el ${dayName}`);
    }

    // Crear y guardar el nuevo día de entrenamiento
    const workoutDay = this.workoutDayRepository.create({
      name: createWorkoutDayDto.name.trim(),
      description: createWorkoutDayDto.description?.trim(),
      dayOfWeek: createWorkoutDayDto.dayOfWeek,
      durationMinutes: createWorkoutDayDto.durationMinutes,
      intensityLevel: createWorkoutDayDto.intensityLevel ?? 3,
      workoutType: createWorkoutDayDto.workoutType ?? 'Fuerza',
      userId: createWorkoutDayDto.userId,
      isActive: true,
    });

    const savedWorkoutDay = await this.workoutDayRepository.save(workoutDay);

    console.log('✅ Día de entrenamiento creado exitosamente en la BD:', savedWorkoutDay);
    return this.mapEntityToInterface(savedWorkoutDay);
  }

  /**
   * ✏️ Actualizar un día de entrenamiento existente en la BD
   * @param {number} id - ID del día de entrenamiento a actualizar
   * @param {UpdateWorkoutDayDto} updateWorkoutDayDto - Datos a actualizar
   * @returns {Promise<WorkoutDay>} Día de entrenamiento actualizado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el día de entrenamiento no existe
   * @throws {ConflictException} Si ya existe otro entrenamiento en el mismo día
   */
  async update(id: number, updateWorkoutDayDto: UpdateWorkoutDayDto): Promise<WorkoutDay> {
    console.log(`✏️ Actualizando día de entrenamiento ID ${id} en la BD:`, updateWorkoutDayDto);

    // Validar ID
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    // Buscar el día de entrenamiento
    const workoutDay = await this.workoutDayRepository.findOne({
      where: { id },
    });

    if (!workoutDay) {
      throw new NotFoundException(`Día de entrenamiento con ID ${id} no encontrado`);
    }

    // Validar conflicto de día de semana solo si se está actualizando el día
    if (updateWorkoutDayDto.dayOfWeek && updateWorkoutDayDto.dayOfWeek !== workoutDay.dayOfWeek) {
      const existingWorkout = await this.workoutDayRepository.findOne({
        where: {
          userId: workoutDay.userId,
          dayOfWeek: updateWorkoutDayDto.dayOfWeek,
          isActive: true
        },
      });

      if (existingWorkout && existingWorkout.id !== id) {
        const dayName = this.getDayName(updateWorkoutDayDto.dayOfWeek);
        throw new ConflictException(`Ya existe otro entrenamiento activo para el ${dayName}`);
      }
    }

    // Actualizar campos proporcionados
    if (updateWorkoutDayDto.name) workoutDay.name = updateWorkoutDayDto.name.trim();
    if (updateWorkoutDayDto.description !== undefined) workoutDay.description = updateWorkoutDayDto.description?.trim();
    if (updateWorkoutDayDto.dayOfWeek !== undefined) workoutDay.dayOfWeek = updateWorkoutDayDto.dayOfWeek;
    if (updateWorkoutDayDto.durationMinutes !== undefined) workoutDay.durationMinutes = updateWorkoutDayDto.durationMinutes;
    if (updateWorkoutDayDto.intensityLevel !== undefined) workoutDay.intensityLevel = updateWorkoutDayDto.intensityLevel;
    if (updateWorkoutDayDto.workoutType !== undefined) workoutDay.workoutType = updateWorkoutDayDto.workoutType;
    if (updateWorkoutDayDto.isActive !== undefined) workoutDay.isActive = updateWorkoutDayDto.isActive;

    const updatedWorkoutDay = await this.workoutDayRepository.save(workoutDay);

    console.log('✅ Día de entrenamiento actualizado exitosamente en la BD:', updatedWorkoutDay);
    return this.mapEntityToInterface(updatedWorkoutDay);
  }

  /**
   * 🗑️ Eliminar un día de entrenamiento (eliminación lógica) en la BD
   * @param {number} id - ID del día de entrenamiento a eliminar
   * @returns {Promise<WorkoutDay>} Día de entrenamiento eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el día de entrenamiento no existe
   * @throws {ConflictException} Si el día de entrenamiento ya estaba eliminado
   */
  async remove(id: number): Promise<WorkoutDay> {
    console.log(`🗑️ Eliminando día de entrenamiento ID ${id} en la BD`);

    // Validar ID
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

    // Eliminación lógica
    workoutDay.isActive = false;
    const deletedWorkoutDay = await this.workoutDayRepository.save(workoutDay);

    console.log('✅ Día de entrenamiento eliminado exitosamente en la BD:', deletedWorkoutDay);
    return this.mapEntityToInterface(deletedWorkoutDay);
  }

  /**
   * 👤 Validar que un usuario existe y está activo
   * @param {number} userId - ID del usuario a validar
   * @throws {NotFoundException} Si el usuario no existe o no está activo
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
   * 📅 Obtener el nombre del día de la semana
   * @param {number} dayNumber - Número del día (1-7)
   * @returns {string} Nombre del día
   */
  private getDayName(dayNumber: number): string {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[dayNumber] || 'Día inválido';
  }

  /**
   * 🔄 Convertir WorkoutDayEntity a WorkoutDay interface
   * @param {WorkoutDayEntity} entity - Entity de la BD
   * @returns {WorkoutDay} Interface para el controlador
   */
  private mapEntityToInterface(entity: WorkoutDayEntity): WorkoutDay {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      dayOfWeek: entity.dayOfWeek,
      durationMinutes: entity.durationMinutes,
      intensityLevel: entity.intensityLevel,
      workoutType: entity.workoutType,
      isActive: entity.isActive,
      userId: entity.userId,
    };
  }

  /**
   * 🔄 Convertir array de WorkoutDayEntity a array de WorkoutDay interface
   * @param {WorkoutDayEntity[]} entities - Array de entities de la BD
   * @returns {WorkoutDay[]} Array de interfaces para el controlador
   */
  private mapEntitiesToInterfaces(entities: WorkoutDayEntity[]): WorkoutDay[] {
    return entities.map((entity) => this.mapEntityToInterface(entity));
  }
}
