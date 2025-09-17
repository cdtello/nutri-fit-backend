import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/user.dto';

/**
 * 🏪 Servicio de usuarios - Lógica de negocio con Base de Datos
 *
 * Este servicio contiene toda la lógica de negocio relacionada con usuarios.
 * Usa TypeORM Repository pattern para persistencia de datos.
 * Compatible con SQLite, PostgreSQL, MySQL, etc.
 *
 * @class UsersService
 * @description Maneja las operaciones CRUD y lógica de negocio de usuarios
 */
@Injectable()
export class UsersService {
  /**
   * Constructor del servicio
   * @param userRepository - Repositorio de TypeORM inyectado para UserEntity
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 📋 Obtener todos los usuarios activos desde la BD
   *
   * Este método obtiene todos los usuarios que tienen isActive = true.
   * Los usuarios "eliminados" tienen isActive = false (eliminación lógica).
   *
   * @returns {Promise<UserEntity[]>} Lista de usuarios activos ordenados por ID
   * @example
   * const usuarios = await usersService.findAll();
   * console.log(usuarios); // [UserEntity, UserEntity, ...]
   */
  async findAll(): Promise<UserEntity[]> {
    console.log('📋 Obteniendo usuarios activos desde la base de datos...');

    return await this.userRepository.find({
      where: { isActive: true }, // Solo usuarios activos
      order: { id: 'ASC' }, // Ordenar por ID ascendente
    });
  }

  /**
   * 🔍 Buscar usuarios con filtros en la BD
   *
   * Permite buscar usuarios aplicando diferentes filtros.
   * Los filtros se pueden combinar para búsquedas más específicas.
   *
   * @param {SearchUserDto} searchUserDto - Objeto con los filtros de búsqueda
   * @returns {Promise<UserEntity[]>} Lista de usuarios que cumplen los filtros
   * @throws {BadRequestException} Si los parámetros de búsqueda son inválidos
   *
   * @example
   * // Buscar por nombre
   * const usuarios = await usersService.search({ name: 'Ana' });
   *
   * // Buscar por múltiples criterios
   * const usuarios = await usersService.search({
   *   name: 'Carlos',
   *   age: 30,
   *   isActive: true
   * });
   */
  async search(searchUserDto: SearchUserDto): Promise<UserEntity[]> {
    console.log('🔍 Buscando usuarios con filtros en la BD:', searchUserDto);

    // Objeto para construir las condiciones WHERE dinámicamente
    const whereConditions: Record<string, any> = {};

    // Filtrar por nombre (búsqueda parcial con LIKE)
    if (searchUserDto.name) {
      whereConditions.name = Like(`%${searchUserDto.name}%`);
    }

    // Filtrar por email (búsqueda parcial con LIKE)
    if (searchUserDto.email) {
      whereConditions.email = Like(`%${searchUserDto.email}%`);
    }

    // Filtrar por edad exacta
    if (searchUserDto.age) {
      whereConditions.age = searchUserDto.age;
    }

    // Filtrar por estado activo
    if (searchUserDto.isActive !== undefined) {
      whereConditions.isActive = searchUserDto.isActive;
    }

    return await this.userRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' }, // Más recientes primero
    });
  }

  /**
   * 👤 Obtener un usuario específico por ID desde la BD
   *
   * Busca un usuario por su ID único. Si no existe, lanza una excepción.
   * Útil para obtener detalles completos de un usuario específico.
   *
   * @param {number} id - ID único del usuario a buscar
   * @returns {Promise<UserEntity>} El usuario encontrado con todos sus datos
   * @throws {BadRequestException} Si el ID no es un número válido
   * @throws {NotFoundException} Si el usuario no existe en la BD
   *
   * @example
   * const usuario = await usersService.findOne(1);
   * console.log(usuario.name); // 'Ana García'
   * console.log(usuario.getAgeGroup()); // 'Joven adulto'
   */
  async findOne(id: number): Promise<UserEntity> {
    console.log(`🔍 Buscando usuario con ID: ${id} en la BD`);

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * ➕ Crear un nuevo usuario en la BD
   *
   * Crea un nuevo usuario después de validar que el email sea único.
   * El usuario se crea siempre como activo (isActive = true).
   *
   * @param {CreateUserDto} createUserDto - Datos validados del nuevo usuario
   * @returns {Promise<UserEntity>} El usuario recién creado con ID asignado
   * @throws {ConflictException} Si ya existe un usuario con ese email
   *
   * @example
   * const nuevoUsuario = await usersService.create({
   *   name: 'Pedro Silva',
   *   email: 'pedro@email.com',
   *   age: 32
   * });
   * console.log(nuevoUsuario.id); // ID auto-generado
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    console.log('➕ Creando nuevo usuario en la BD:', createUserDto);

    // Validar que el email no exista (emails deben ser únicos)
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email ${createUserDto.email}`);
    }

    // Crear el nuevo usuario con datos limpios
    const user = this.userRepository.create({
      name: createUserDto.name.trim(), // Remover espacios extra
      email: createUserDto.email.toLowerCase().trim(), // Email en minúsculas
      age: createUserDto.age,
      isActive: true, // Siempre activo al crear
    });

    const savedUser = await this.userRepository.save(user);
    console.log('✅ Usuario creado exitosamente en la BD:', savedUser);

    return savedUser;
  }

  /**
   * ✏️ Actualizar un usuario existente en la BD
   *
   * Actualiza solo los campos proporcionados en el DTO.
   * Valida que el email sea único si se está cambiando.
   * Permite actualizaciones parciales (no es necesario enviar todos los campos).
   *
   * @param {number} id - ID del usuario a actualizar
   * @param {UpdateUserDto} updateUserDto - Campos a actualizar (solo los proporcionados)
   * @returns {Promise<UserEntity>} El usuario actualizado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el nuevo email ya existe en otro usuario
   *
   * @example
   * // Actualizar solo el nombre
   * const usuario = await usersService.update(1, { name: 'Ana García Actualizada' });
   *
   * // Actualizar múltiples campos
   * const usuario = await usersService.update(1, {
   *   name: 'Ana García',
   *   age: 26,
   *   email: 'ana.nueva@email.com'
   * });
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    console.log(`✏️ Actualizando usuario ID ${id} en la BD:`, updateUserDto);

    // Validar que el ID sea válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    // Buscar el usuario a actualizar
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Validar email único solo si se está actualizando el email
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Ya existe otro usuario con el email ${updateUserDto.email}`);
      }
    }

    // Actualizar solo los campos proporcionados (actualización parcial)
    if (updateUserDto.name) user.name = updateUserDto.name.trim();
    if (updateUserDto.email) user.email = updateUserDto.email.toLowerCase().trim();
    if (updateUserDto.age !== undefined) user.age = updateUserDto.age;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;

    const updatedUser = await this.userRepository.save(user);
    console.log('✅ Usuario actualizado exitosamente en la BD:', updatedUser);

    return updatedUser;
  }

  /**
   * 🗑️ Eliminar un usuario (eliminación lógica) en la BD
   *
   * Realiza una eliminación lógica cambiando isActive a false.
   * No elimina físicamente el registro de la BD (soft delete).
   * Esto permite recuperar el usuario más tarde si es necesario.
   *
   * @param {number} id - ID del usuario a eliminar
   * @returns {Promise<UserEntity>} El usuario marcado como eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el usuario ya estaba eliminado
   *
   * @example
   * const usuarioEliminado = await usersService.remove(1);
   * console.log(usuarioEliminado.isActive); // false
   *
   * // Para reactivar, usar update:
   * await usersService.update(1, { isActive: true });
   */
  async remove(id: number): Promise<UserEntity> {
    console.log(`🗑️ Eliminando usuario ID ${id} en la BD`);

    // Validar que el ID sea válido
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!user.isActive) {
      throw new ConflictException(`Usuario con ID ${id} ya estaba eliminado`);
    }

    // Eliminación lógica: cambiar isActive a false
    user.isActive = false;
    const deletedUser = await this.userRepository.save(user);

    console.log('✅ Usuario eliminado exitosamente en la BD:', deletedUser);
    return deletedUser;
  }
}
