import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateWorkoutDayDto, UpdateWorkoutDayDto, SearchWorkoutDayDto } from '../dto/workout-day.dto';
import type { WorkoutDay } from '../interfaces/workout-day.interface';
import { WorkoutDaysService } from '../services/workout-days.service';

@Controller('workout-days')
export class WorkoutDaysController {
  constructor(private readonly workoutDaysService: WorkoutDaysService) {}

  /**
   * 📋 Obtener todos los días de entrenamiento activos (Status: 200 OK)
   * URL: GET http://localhost:3000/workout-days
   * Status Code: 200 (automático para GET exitoso)
   * Nota: Solo devuelve días de entrenamiento con isActive = true
   */
  @Get()
  async getAllWorkoutDays(): Promise<WorkoutDay[]> {
    return await this.workoutDaysService.findAll();
  }

  /**
   * 👤 Obtener todos los días de entrenamiento de un usuario específico (Status: 200 OK)
   * URL: GET http://localhost:3000/workout-days/user/1
   * Status Codes:
   *   - 200: Días de entrenamiento encontrados
   *   - 404: Usuario no encontrado
   */
  @Get('user/:userId')
  async getWorkoutDaysByUser(@Param('userId') userId: string): Promise<WorkoutDay[]> {
    const userIdNumber = parseInt(userId);
    return await this.workoutDaysService.findByUserId(userIdNumber);
  }

  /**
   * 🔍 Buscar días de entrenamiento con filtros (Status: 200 OK)
   * URL: GET http://localhost:3000/workout-days/search?name=Pecho
   * URL: GET http://localhost:3000/workout-days/search?dayOfWeek=1
   * URL: GET http://localhost:3000/workout-days/search?workoutType=Cardio
   * URL: GET http://localhost:3000/workout-days/search?intensityLevel=4
   * URL: GET http://localhost:3000/workout-days/search?userId=1
   * Status Codes:
   *   - 200: Búsqueda exitosa (con o sin resultados)
   *   - 400: Parámetros de búsqueda inválidos
   */
  @Get('search')
  async searchWorkoutDays(@Query() searchWorkoutDayDto: SearchWorkoutDayDto): Promise<WorkoutDay[]> {
    return await this.workoutDaysService.search(searchWorkoutDayDto);
  }

  /**
   * ➕ Crear un nuevo día de entrenamiento (Status: 201 Created)
   * URL: POST http://localhost:3000/workout-days
   * Body: {
   *   "name": "Jueves - Espalda y Bíceps",
   *   "description": "Rutina completa de espalda con dominadas y remo",
   *   "dayOfWeek": 4,
   *   "durationMinutes": 80,
   *   "intensityLevel": 4,
   *   "workoutType": "Fuerza",
   *   "userId": 1
   * }
   * Status Codes:
   *   - 201: Día de entrenamiento creado exitosamente
   *   - 400: Datos inválidos
   *   - 404: Usuario no encontrado
   *   - 409: Ya existe un entrenamiento para ese día de la semana
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkoutDay(@Body() createWorkoutDayDto: CreateWorkoutDayDto): Promise<WorkoutDay> {
    return await this.workoutDaysService.create(createWorkoutDayDto);
  }

  /**
   * ✏️ Actualizar un día de entrenamiento existente (Status: 200 OK)
   * URL: PUT http://localhost:3000/workout-days/1
   * Body: {
   *   "name": "Lunes - Pecho y Tríceps Actualizado",
   *   "durationMinutes": 100,
   *   "intensityLevel": 5
   * }
   * Status Codes:
   *   - 200: Día de entrenamiento actualizado exitosamente
   *   - 400: Datos inválidos
   *   - 404: Día de entrenamiento no encontrado
   *   - 409: Conflicto con otro entrenamiento en el mismo día
   */
  @Put(':id')
  async updateWorkoutDay(@Param('id') id: string, @Body() updateWorkoutDayDto: UpdateWorkoutDayDto): Promise<WorkoutDay> {
    const workoutDayId = parseInt(id);
    return await this.workoutDaysService.update(workoutDayId, updateWorkoutDayDto);
  }

  /**
   * 🗑️ Eliminar un día de entrenamiento (Status: 200 OK)
   * URL: DELETE http://localhost:3000/workout-days/1
   * Status Codes:
   *   - 200: Día de entrenamiento eliminado exitosamente
   *   - 400: ID inválido
   *   - 404: Día de entrenamiento no encontrado
   *   - 409: Día de entrenamiento ya estaba eliminado
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
   * URL: GET http://localhost:3000/workout-days/1
   * URL: GET http://localhost:3000/workout-days/2
   * Status Codes:
   *   - 200: Día de entrenamiento encontrado
   *   - 400: ID inválido
   *   - 404: Día de entrenamiento no encontrado
   */
  @Get(':id')
  async getWorkoutDayById(@Param('id') id: string): Promise<WorkoutDay> {
    const workoutDayId = parseInt(id);
    return await this.workoutDaysService.findOne(workoutDayId);
  }
}
