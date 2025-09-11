import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/user.dto';
import type { User } from '../interfaces/user.interface';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 📋 Obtener todos los usuarios activos (Status: 200 OK)
   * URL: GET http://localhost:3000/users
   * Status Code: 200 (automático para GET exitoso)
   * Nota: Solo devuelve usuarios con isActive = true
   */
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  /**
   * 🔍 Buscar usuarios con filtros (Status: 200 OK)
   * URL: GET http://localhost:3000/users/search?name=Ana
   * URL: GET http://localhost:3000/users/search?email=carlos@email.com
   * URL: GET http://localhost:3000/users/search?age=25
   * URL: GET http://localhost:3000/users/search?isActive=true
   * Status Codes:
   *   - 200: Búsqueda exitosa (con o sin resultados)
   *   - 400: Parámetros de búsqueda inválidos
   */
  @Get('search')
  async searchUsers(@Query() searchUserDto: SearchUserDto): Promise<User[]> {
    return await this.usersService.search(searchUserDto);
  }

  /**
   * ➕ Crear un nuevo usuario (Status: 201 Created o 409 Conflict)
   * URL: POST http://localhost:3000/users
   * Body: { "name": "Pedro Silva", "email": "pedro@email.com", "age": 32 }
   * Status Codes:
   *   - 201: Usuario creado exitosamente
   *   - 400: Datos inválidos
   *   - 409: Email ya existe (conflicto)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * ✏️ Actualizar un usuario existente (Status: 200 OK)
   * URL: PUT http://localhost:3000/users/1
   * Body: { "name": "Ana García Actualizada", "age": 26 }
   * Status Codes:
   *   - 200: Usuario actualizado exitosamente
   *   - 400: Datos inválidos
   *   - 404: Usuario no encontrado
   *   - 409: Email ya existe en otro usuario
   */
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const userId = parseInt(id);
    return await this.usersService.update(userId, updateUserDto);
  }

  /**
   * 🗑️ Eliminar un usuario (Status: 200 OK)
   * URL: DELETE http://localhost:3000/users/1
   * Status Codes:
   *   - 200: Usuario eliminado exitosamente
   *   - 400: ID inválido
   *   - 404: Usuario no encontrado
   *   - 409: Usuario ya estaba eliminado
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
   * URL: GET http://localhost:3000/users/1
   * URL: GET http://localhost:3000/users/2
   * Status Codes:
   *   - 200: Usuario encontrado
   *   - 400: ID inválido
   *   - 404: Usuario no encontrado
   */
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const userId = parseInt(id);
    return await this.usersService.findOne(userId);
  }
}
