import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/user.dto';

/**
 * 🏪 Servicio de usuarios - Lógica de negocio
 * Contiene toda la lógica de manejo de datos y reglas de negocio
 */
@Injectable()
export class UsersService {
  // 🎭 Datos falsos para practicar (mock data)
  private users: User[] = [
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
   * 📋 Obtener todos los usuarios activos
   * @returns {User[]} Lista de usuarios activos solamente
   */
  findAll(): User[] {
    console.log('📋 Obteniendo usuarios activos desde el servicio...');
    // Filtrar solo usuarios activos
    return this.users.filter((user) => user.isActive === true);
  }

  /**
   * 🔍 Buscar usuarios con filtros
   * @param {SearchUserDto} searchUserDto - Filtros de búsqueda
   * @returns {User[]} Lista de usuarios filtrados
   */
  search(searchUserDto: SearchUserDto): User[] {
    console.log('🔍 Buscando usuarios con filtros:', searchUserDto);

    let filteredUsers = this.users;

    // Filtrar por nombre (si se proporciona)
    if (searchUserDto.name) {
      filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(searchUserDto.name!.toLowerCase()));
    }

    // Filtrar por email (si se proporciona)
    if (searchUserDto.email) {
      filteredUsers = filteredUsers.filter((user) => user.email.toLowerCase().includes(searchUserDto.email!.toLowerCase()));
    }

    // Filtrar por edad (si se proporciona)
    if (searchUserDto.age) {
      filteredUsers = filteredUsers.filter((user) => user.age === searchUserDto.age);
    }

    // Filtrar por estado activo (si se proporciona)
    if (searchUserDto.isActive !== undefined) {
      filteredUsers = filteredUsers.filter((user) => user.isActive === searchUserDto.isActive);
    }

    return filteredUsers;
  }

  /**
   * 👤 Obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {User} Usuario encontrado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   */
  findOne(id: number): User {
    console.log(`🔍 Buscando usuario con ID: ${id}`);

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    // Buscar el usuario
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * ➕ Crear un nuevo usuario
   * @param {CreateUserDto} createUserDto - Datos del nuevo usuario
   * @returns {User} Usuario creado
   * @throws {ConflictException} Si el email ya existe
   */
  create(createUserDto: CreateUserDto): User {
    console.log('➕ Creando nuevo usuario:', createUserDto);

    // Validar que el email no exista
    const existingUser = this.users.find((user) => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email ${createUserDto.email}`);
    }

    // Generar nuevo ID
    const newId = Math.max(...this.users.map((user) => user.id)) + 1;

    // Crear el nuevo usuario
    const newUser: User = {
      id: newId,
      name: createUserDto.name.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      age: createUserDto.age,
      isActive: true,
    };

    // Agregar a la lista
    this.users.push(newUser);

    console.log('✅ Usuario creado exitosamente:', newUser);
    return newUser;
  }

  /**
   * ✏️ Actualizar un usuario existente
   * @param {number} id - ID del usuario a actualizar
   * @param {UpdateUserDto} updateUserDto - Datos a actualizar
   * @returns {User} Usuario actualizado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el email ya existe en otro usuario
   */
  update(id: number, updateUserDto: UpdateUserDto): User {
    console.log(`✏️ Actualizando usuario ID ${id}:`, updateUserDto);

    // Validar ID
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Validar email único solo si se está actualizando el email
    if (updateUserDto.email) {
      const existingUser = this.users.find((user) => user.email === updateUserDto.email && user.id !== id);
      if (existingUser) {
        throw new ConflictException(`Ya existe otro usuario con el email ${updateUserDto.email}`);
      }
    }

    // Limpiar datos antes de actualizar
    const cleanData: Partial<User> = {};
    if (updateUserDto.name) cleanData.name = updateUserDto.name.trim();
    if (updateUserDto.email) cleanData.email = updateUserDto.email.toLowerCase().trim();
    if (updateUserDto.age !== undefined) cleanData.age = updateUserDto.age;
    if (updateUserDto.isActive !== undefined) cleanData.isActive = updateUserDto.isActive;

    // Actualizar usuario
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...cleanData,
    };

    console.log('✅ Usuario actualizado exitosamente:', this.users[userIndex]);
    return this.users[userIndex];
  }

  /**
   * 🗑️ Eliminar un usuario (eliminación lógica)
   * @param {number} id - ID del usuario a eliminar
   * @returns {User} Usuario eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el usuario ya estaba eliminado
   */
  remove(id: number): User {
    console.log(`🗑️ Eliminando usuario ID ${id}`);

    // Validar ID
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!this.users[userIndex].isActive) {
      throw new ConflictException(`Usuario con ID ${id} ya estaba eliminado`);
    }

    // Eliminación lógica
    this.users[userIndex].isActive = false;

    console.log('✅ Usuario eliminado exitosamente:', this.users[userIndex]);
    return this.users[userIndex];
  }
}
