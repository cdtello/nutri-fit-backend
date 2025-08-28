import { Controller, Get, Param, Query } from '@nestjs/common';
import { User } from './user.interface';

@Controller('users')
export class UsersController {
  // 🎭 Datos falsos para practicar (mock data)
  private readonly users: User[] = [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana@email.com',
      age: 25,
      isActive: true,
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos@email.com',
      age: 30,
      isActive: true,
    },
    {
      id: 3,
      name: 'María Rodríguez',
      email: 'maria@email.com',
      age: 28,
      isActive: false,
    },
    {
      id: 4,
      name: 'Juan Pérez',
      email: 'juan@email.com',
      age: 35,
      isActive: true,
    },
  ];

  /**
   * 📋 Obtener todos los usuarios
   * URL: GET http://localhost:3000/users
   */
  @Get()
  getAllUsers(): User[] {
    console.log('📋 Solicitando todos los usuarios...');
    return this.users;
  }

  /**
   * 🔍 Buscar usuarios con filtros (Query Parameters)
   * URL: GET http://localhost:3000/users/search?name=Ana
   * URL: GET http://localhost:3000/users/search?email=carlos@email.com
   * URL: GET http://localhost:3000/users/search?age=25
   */
  @Get('search')
  searchUsers(@Query('name') name?: string, @Query('email') email?: string, @Query('age') age?: string): User[] | { message: string } {
    console.log('🔍 Buscando usuarios con filtros:', { name, email, age });

    let filteredUsers = this.users;

    // Filtrar por nombre (si se proporciona)
    if (name) {
      filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
    }

    // Filtrar por email (si se proporciona)
    if (email) {
      filteredUsers = filteredUsers.filter((user) => user.email.toLowerCase().includes(email.toLowerCase()));
    }

    // Filtrar por edad (si se proporciona)
    if (age) {
      const ageNumber = parseInt(age);
      filteredUsers = filteredUsers.filter((user) => user.age === ageNumber);
    }

    // Si no se encuentra nada
    if (filteredUsers.length === 0) {
      return {
        message: '❌ No se encontraron usuarios con esos criterios',
      };
    }

    return filteredUsers;
  }

  /**
   * 👤 Obtener un usuario específico por ID
   * URL: GET http://localhost:3000/users/1
   * URL: GET http://localhost:3000/users/2
   */
  @Get(':id')
  getUserById(@Param('id') id: string): User | { message: string } {
    console.log(`🔍 Buscando usuario con ID: ${id}`);

    // Convertir string a número
    const userId = parseInt(id);

    // Buscar el usuario
    const user = this.users.find((user) => user.id === userId);

    // Si no existe, devolver error amigable
    if (!user) {
      return {
        message: `❌ Usuario con ID ${id} no encontrado`,
      };
    }

    // Si existe, devolver el usuario
    return user;
  }
}
