import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

/**
 * 🎮 Controlador de usuarios - Endpoints de la API REST
 *
 * Este controlador define todos los endpoints relacionados con usuarios.
 * Maneja las peticiones HTTP y delega la lógica de negocio al servicio.
 * Implementa el patrón MVC (Model-View-Controller).
 *
 * @class UsersController
 * @description Controlador REST para operaciones CRUD de usuarios
 */
@Controller('users') // Prefijo de ruta: /users
export class UsersController {
  /**
   * Constructor - Inyección de dependencias
   * @param usersService - Servicio con la lógica de negocio
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * 📋 Obtener todos los usuarios activos (Status: 200 OK)
   *
   * Endpoint para listar todos los usuarios con isActive = true.
   * No requiere parámetros y devuelve un array de usuarios.
   *
   * @route GET /users
   * @returns {Promise<UserEntity[]>} Lista de usuarios activos
   * @status 200 - Búsqueda exitosa (con o sin resultados)
   *
   * @example
   * GET http://localhost:3000/users
   * Response: [{ id: 1, name: 'Ana', email: 'ana@email.com', age: 25, isActive: true }, ...]
   */
  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  /**
   * 🔍 Buscar usuarios con filtros (Status: 200 OK)
   *
   * Endpoint para búsquedas avanzadas con query parameters.
   * Los filtros son opcionales y se pueden combinar.
   *
   * @route GET /users/search
   * @query {string} [name] - Buscar por nombre (búsqueda parcial)
   * @query {string} [email] - Buscar por email (búsqueda parcial)
   * @query {number} [age] - Buscar por edad exacta
   * @query {boolean} [isActive] - Filtrar por estado activo
   * @returns {Promise<UserEntity[]>} Usuarios que cumplen los criterios
   * @status 200 - Búsqueda exitosa (con o sin resultados)
   * @status 400 - Parámetros de búsqueda inválidos
   *
   * @example
   * GET http://localhost:3000/users/search?name=Ana
   * GET http://localhost:3000/users/search?age=25&isActive=true
   * GET http://localhost:3000/users/search?email=carlos@email.com
   */
  @Get('search')
  async searchUsers(@Query() searchUserDto: SearchUserDto): Promise<UserEntity[]> {
    return await this.usersService.search(searchUserDto);
  }

  /**
   * ➕ Crear un nuevo usuario (Status: 201 Created)
   *
   * Endpoint para crear un usuario nuevo con validación de datos.
   * El email debe ser único en todo el sistema.
   *
   * @route POST /users
   * @body {CreateUserDto} createUserDto - Datos del usuario a crear
   * @returns {Promise<UserEntity>} El usuario creado con ID asignado
   * @status 201 - Usuario creado exitosamente
   * @status 400 - Datos inválidos (validación de DTO)
   * @status 409 - Email ya existe (conflicto)
   *
   * @example
   * POST http://localhost:3000/users
   * Body: { "name": "Pedro Silva", "email": "pedro@email.com", "age": 32 }
   * Response: { id: 5, name: "Pedro Silva", email: "pedro@email.com", age: 32, isActive: true, ... }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Explicitamente devolver 201 en lugar de 200
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * ✏️ Actualizar un usuario existente (Status: 200 OK)
   *
   * Endpoint para actualización parcial de usuarios.
   * Solo se actualizan los campos proporcionados en el body.
   *
   * @route PUT /users/:id
   * @param {string} id - ID del usuario en la URL
   * @body {UpdateUserDto} updateUserDto - Campos a actualizar (opcionales)
   * @returns {Promise<UserEntity>} El usuario actualizado
   * @status 200 - Usuario actualizado exitosamente
   * @status 400 - ID inválido o datos inválidos
   * @status 404 - Usuario no encontrado
   * @status 409 - Email ya existe en otro usuario
   *
   * @example
   * PUT http://localhost:3000/users/1
   * Body: { "name": "Ana García Actualizada", "age": 26 }
   * Response: { id: 1, name: "Ana García Actualizada", age: 26, ... }
   */
  @Put(':id') // :id es un parámetro de ruta
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const userId = parseInt(id); // Convertir string a number
    return await this.usersService.update(userId, updateUserDto);
  }

  /**
   * 🗑️ Eliminar un usuario (Status: 200 OK)
   *
   * Endpoint para eliminación lógica de usuarios.
   * No elimina físicamente, solo cambia isActive a false.
   *
   * @route DELETE /users/:id
   * @param {string} id - ID del usuario en la URL
   * @returns {Promise<{message: string}>} Mensaje de confirmación
   * @status 200 - Usuario eliminado exitosamente
   * @status 400 - ID inválido
   * @status 404 - Usuario no encontrado
   * @status 409 - Usuario ya estaba eliminado
   *
   * @example
   * DELETE http://localhost:3000/users/1
   * Response: { "message": "✅ Usuario Ana García eliminado exitosamente" }
   */
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    const userId = parseInt(id);
    const deletedUser = await this.usersService.remove(userId);
    return {
      message: `✅ Usuario ${deletedUser.name} eliminado exitosamente`,
    };
  }

  /**
   * 👤 Obtener un usuario específico por ID (Status: 200 OK o 404 Not Found)
   *
   * Endpoint para obtener los detalles completos de un usuario.
   * Devuelve el usuario con todos sus datos y métodos disponibles.
   *
   * @route GET /users/:id
   * @param {string} id - ID del usuario en la URL
   * @returns {Promise<UserEntity>} El usuario encontrado
   * @status 200 - Usuario encontrado
   * @status 400 - ID inválido (no es un número)
   * @status 404 - Usuario no encontrado
   *
   * @example
   * GET http://localhost:3000/users/1
   * Response: { id: 1, name: "Ana García", email: "ana@email.com", age: 25, isActive: true, ... }
   *
   * GET http://localhost:3000/users/999
   * Response: { "message": "Usuario con ID 999 no encontrado", "error": "Not Found", "statusCode": 404 }
   */
  @Get(':id') // Este decorador debe ir DESPUÉS de otros @Get más específicos
  async getUserById(@Param('id') id: string): Promise<UserEntity> {
    const userId = parseInt(id);
    return await this.usersService.findOne(userId);
  }
}
