import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateWorkoutDayDto, UpdateWorkoutDayDto, SearchWorkoutDayDto } from '../dto/workout-day.dto';
import { WorkoutDayEntity } from '../entities/workout-day.entity';
import { WorkoutDaysService } from '../services/workout-days.service';

/**
 * 🏋️ Controlador de días de entrenamiento - Endpoints de la API REST
 *
 * Este controlador maneja todos los endpoints relacionados con entrenamientos.
 * Implementa operaciones CRUD completas y búsquedas avanzadas.
 * Incluye endpoints específicos para filtrar por usuario.
 *
 * @class WorkoutDaysController
 * @description Controlador REST para operaciones de días de entrenamiento
 */
@Controller('workout-days') // Prefijo de ruta: /workout-days
export class WorkoutDaysController {
  /**
   * Constructor - Inyección de dependencias
   * @param workoutDaysService - Servicio con la lógica de negocio
   */
  constructor(private readonly workoutDaysService: WorkoutDaysService) {}

  /**
   * 📋 Obtener todos los días de entrenamiento activos (Status: 200 OK)
   *
   * Endpoint para listar todos los entrenamientos activos del sistema.
   * Los entrenamientos se devuelven ordenados por día de la semana.
   *
   * @route GET /workout-days
   * @returns {Promise<WorkoutDayEntity[]>} Lista de entrenamientos activos
   * @status 200 - Búsqueda exitosa (con o sin resultados)
   *
   * @example
   * GET http://localhost:3000/workout-days
   * Response: [{ id: 1, name: 'Lunes - Pecho', dayOfWeek: 1, userId: 1, ... }, ...]
   */
  @Get()
  async getAllWorkoutDays(): Promise<WorkoutDayEntity[]> {
    return await this.workoutDaysService.findAll();
  }

  /**
   * 👤 Obtener entrenamientos de un usuario específico (Status: 200 OK)
   *
   * Endpoint para obtener la rutina semanal completa de un usuario.
   * Los entrenamientos se devuelven ordenados por día de la semana.
   *
   * @route GET /workout-days/user/:userId
   * @param {string} userId - ID del usuario en la URL
   * @returns {Promise<WorkoutDayEntity[]>} Entrenamientos del usuario
   * @status 200 - Entrenamientos encontrados
   * @status 404 - Usuario no encontrado o no activo
   *
   * @example
   * GET http://localhost:3000/workout-days/user/1
   * Response: [{ id: 1, name: 'Lunes - Pecho', dayOfWeek: 1, userId: 1, ... }, ...]
   */
  @Get('user/:userId')
  async getWorkoutDaysByUser(@Param('userId') userId: string): Promise<WorkoutDayEntity[]> {
    const userIdNumber = parseInt(userId);
    return await this.workoutDaysService.findByUserId(userIdNumber);
  }

  /**
   * 🔍 Buscar días de entrenamiento con filtros (Status: 200 OK)
   *
   * Endpoint para búsquedas avanzadas de entrenamientos.
   * Permite combinar múltiples criterios de filtrado.
   *
   * @route GET /workout-days/search
   * @query {string} [name] - Buscar por nombre (búsqueda parcial)
   * @query {number} [dayOfWeek] - Filtrar por día de semana (1-7)
   * @query {string} [workoutType] - Filtrar por tipo (Cardio, Fuerza, etc.)
   * @query {number} [intensityLevel] - Filtrar por intensidad (1-5)
   * @query {number} [durationMinutes] - Filtrar por duración exacta
   * @query {number} [userId] - Filtrar por usuario
   * @query {boolean} [isActive] - Filtrar por estado activo
   * @returns {Promise<WorkoutDayEntity[]>} Entrenamientos que cumplen los criterios
   * @status 200 - Búsqueda exitosa (con o sin resultados)
   * @status 400 - Parámetros de búsqueda inválidos
   *
   * @example
   * GET http://localhost:3000/workout-days/search?workoutType=Cardio
   * GET http://localhost:3000/workout-days/search?dayOfWeek=1&intensityLevel=5
   * GET http://localhost:3000/workout-days/search?name=Pecho&userId=1
   */
  @Get('search')
  async searchWorkoutDays(@Query() searchWorkoutDayDto: SearchWorkoutDayDto): Promise<WorkoutDayEntity[]> {
    return await this.workoutDaysService.search(searchWorkoutDayDto);
  }

  /**
   * ➕ Crear un nuevo día de entrenamiento (Status: 201 Created)
   *
   * Endpoint para crear un entrenamiento en un día específico.
   * Valida que el usuario exista y que no haya otro entrenamiento en ese día.
   *
   * @route POST /workout-days
   * @body {CreateWorkoutDayDto} createWorkoutDayDto - Datos del entrenamiento
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento creado con ID asignado
   * @status 201 - Entrenamiento creado exitosamente
   * @status 400 - Datos inválidos (validación de DTO)
   * @status 404 - Usuario no encontrado
   * @status 409 - Ya existe un entrenamiento para ese día de la semana
   *
   * @example
   * POST http://localhost:3000/workout-days
   * Body: {
   *   "name": "Jueves - Espalda y Bíceps",
   *   "description": "Rutina completa de espalda con dominadas y remo",
   *   "dayOfWeek": 4,
   *   "durationMinutes": 80,
   *   "intensityLevel": 4,
   *   "workoutType": "Fuerza",
   *   "userId": 1
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkoutDay(@Body() createWorkoutDayDto: CreateWorkoutDayDto): Promise<WorkoutDayEntity> {
    return await this.workoutDaysService.create(createWorkoutDayDto);
  }

  /**
   * ✏️ Actualizar un día de entrenamiento existente (Status: 200 OK)
   *
   * Endpoint para actualización parcial de entrenamientos.
   * Si se cambia el día de la semana, valida que no haya conflictos.
   *
   * @route PUT /workout-days/:id
   * @param {string} id - ID del entrenamiento en la URL
   * @body {UpdateWorkoutDayDto} updateWorkoutDayDto - Campos a actualizar
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento actualizado
   * @status 200 - Entrenamiento actualizado exitosamente
   * @status 400 - ID inválido o datos inválidos
   * @status 404 - Entrenamiento no encontrado
   * @status 409 - Conflicto con otro entrenamiento en el mismo día
   *
   * @example
   * PUT http://localhost:3000/workout-days/1
   * Body: {
   *   "name": "Lunes - Pecho y Tríceps Actualizado",
   *   "durationMinutes": 100,
   *   "intensityLevel": 5
   * }
   */
  @Put(':id')
  async updateWorkoutDay(@Param('id') id: string, @Body() updateWorkoutDayDto: UpdateWorkoutDayDto): Promise<WorkoutDayEntity> {
    const workoutDayId = parseInt(id);
    return await this.workoutDaysService.update(workoutDayId, updateWorkoutDayDto);
  }

  /**
   * 🗑️ Eliminar un día de entrenamiento (Status: 200 OK)
   *
   * Endpoint para eliminación lógica de entrenamientos.
   * No elimina físicamente, solo cambia isActive a false.
   *
   * @route DELETE /workout-days/:id
   * @param {string} id - ID del entrenamiento en la URL
   * @returns {Promise<{message: string}>} Mensaje de confirmación
   * @status 200 - Entrenamiento eliminado exitosamente
   * @status 400 - ID inválido
   * @status 404 - Entrenamiento no encontrado
   * @status 409 - Entrenamiento ya estaba eliminado
   *
   * @example
   * DELETE http://localhost:3000/workout-days/1
   * Response: { "message": "✅ Día de entrenamiento 'Lunes - Pecho' eliminado exitosamente" }
   */
  @Delete(':id')
  async deleteWorkoutDay(@Param('id') id: string): Promise<{ message: string }> {
    const workoutDayId = parseInt(id);
    const deletedWorkoutDay = await this.workoutDaysService.remove(workoutDayId);
    return {
      message: `✅ Día de entrenamiento "${deletedWorkoutDay.name}" eliminado exitosamente`,
    };
  }

  /**
   * 🏋️ Obtener un día de entrenamiento específico por ID (Status: 200 OK o 404 Not Found)
   *
   * Endpoint para obtener los detalles completos de un entrenamiento.
   * Devuelve el entrenamiento con todos sus datos y métodos disponibles.
   *
   * @route GET /workout-days/:id
   * @param {string} id - ID del entrenamiento en la URL
   * @returns {Promise<WorkoutDayEntity>} El entrenamiento encontrado
   * @status 200 - Entrenamiento encontrado
   * @status 400 - ID inválido (no es un número)
   * @status 404 - Entrenamiento no encontrado
   *
   * @example
   * GET http://localhost:3000/workout-days/1
   * Response: {
   *   id: 1,
   *   name: "Lunes - Pecho y Tríceps",
   *   dayOfWeek: 1,
   *   durationMinutes: 90,
   *   intensityLevel: 4,
   *   workoutType: "Fuerza",
   *   userId: 1,
   *   ...
   * }
   */
  @Get(':id') // Este decorador debe ir DESPUÉS de otros @Get más específicos
  async getWorkoutDayById(@Param('id') id: string): Promise<WorkoutDayEntity> {
    const workoutDayId = parseInt(id);
    return await this.workoutDaysService.findOne(workoutDayId);
  }
}
