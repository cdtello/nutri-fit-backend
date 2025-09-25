import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, SearchUserDto, UserResponseDto } from '../dto/user.dto';
import { UserStatus } from '../interfaces/user.interface';

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
   * Este método obtiene todos los usuarios que tienen status = ACTIVE.
   * Los usuarios "eliminados" tienen status = INACTIVE (eliminación lógica).
   *
   * @returns {Promise<UserResponseDto[]>} Lista de usuarios activos ordenados por ID
   * @example
   * const usuarios = await usersService.findAll();
   * console.log(usuarios); // [UserResponseDto, UserResponseDto, ...]
   */
  async findAll(): Promise<UserResponseDto[]> {
    console.log('📋 Obteniendo usuarios activos desde la base de datos...');

    const users = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE }, // Solo usuarios activos
      order: { id: 'ASC' }, // Ordenar por ID ascendente
    });

    return users.map((user) => this.mapToResponseDto(user));
  }

  /**
   * 🔍 Buscar usuarios con filtros en la BD
   *
   * Permite buscar usuarios aplicando diferentes filtros.
   * Los filtros se pueden combinar para búsquedas más específicas.
   *
   * @param {SearchUserDto} searchUserDto - Objeto con los filtros de búsqueda
   * @returns {Promise<UserResponseDto[]>} Lista de usuarios que cumplen los filtros
   * @throws {BadRequestException} Si los parámetros de búsqueda son inválidos
   *
   * @example
   * // Buscar por nombre
   * const usuarios = await usersService.search({ name: 'Ana' });
   *
   * // Buscar por múltiples criterios
   * const usuarios = await usersService.search({
   *   name: 'Carlos',
   *   role: UserRole.TRAINER,
   *   status: UserStatus.ACTIVE
   * });
   */
  async search(searchUserDto: SearchUserDto): Promise<UserResponseDto[]> {
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

    // Filtrar por rol
    if (searchUserDto.role) {
      whereConditions.role = searchUserDto.role;
    }

    // Filtrar por estado
    if (searchUserDto.status) {
      whereConditions.status = searchUserDto.status;
    }

    // Filtrar por ubicación (búsqueda parcial con LIKE)
    if (searchUserDto.location) {
      whereConditions.location = Like(`%${searchUserDto.location}%`);
    }

    const users = await this.userRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' }, // Más recientes primero
    });

    return users.map((user) => this.mapToResponseDto(user));
  }

  /**
   * 👤 Obtener un usuario específico por ID desde la BD
   *
   * Busca un usuario por su ID único. Si no existe, lanza una excepción.
   * Útil para obtener detalles completos de un usuario específico.
   *
   * @param {number} id - ID único del usuario a buscar
   * @returns {Promise<UserResponseDto>} El usuario encontrado con todos sus datos
   * @throws {BadRequestException} Si el ID no es un número válido
   * @throws {NotFoundException} Si el usuario no existe en la BD
   *
   * @example
   * const usuario = await usersService.findOne(1);
   * console.log(usuario.name); // 'Ana García'
   * console.log(usuario.role); // UserRole.USER
   */
  async findOne(id: number): Promise<UserResponseDto> {
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

    return this.mapToResponseDto(user);
  }

  /**
   * ➕ Crear un nuevo usuario en la BD
   *
   * Crea un nuevo usuario después de validar que el email sea único.
   * El usuario se crea siempre como activo (status = ACTIVE).
   *
   * @param {CreateUserDto} createUserDto - Datos validados del nuevo usuario
   * @returns {Promise<UserResponseDto>} El usuario recién creado con ID asignado
   * @throws {ConflictException} Si ya existe un usuario con ese email
   *
   * @example
   * const nuevoUsuario = await usersService.create({
   *   name: 'Pedro Silva',
   *   email: 'pedro@email.com',
   *   role: UserRole.TRAINER
   * });
   * console.log(nuevoUsuario.id); // ID auto-generado
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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
      role: createUserDto.role, // Rol especificado o default
      avatar: createUserDto.avatar,
      status: UserStatus.ACTIVE, // Siempre activo al crear
      bio: createUserDto.bio,
      phone: createUserDto.phone,
      location: createUserDto.location,
      specialties: createUserDto.specialties,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('✅ Usuario creado exitosamente en la BD:', savedUser);

    return this.mapToResponseDto(savedUser);
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
   * @returns {Promise<UserResponseDto>} El usuario actualizado
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
   *   role: UserRole.TRAINER,
   *   email: 'ana.nueva@email.com'
   * });
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
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
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;
    if (updateUserDto.avatar !== undefined) user.avatar = updateUserDto.avatar;
    if (updateUserDto.status !== undefined) user.status = updateUserDto.status;
    if (updateUserDto.bio !== undefined) user.bio = updateUserDto.bio;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
    if (updateUserDto.location !== undefined) user.location = updateUserDto.location;
    if (updateUserDto.specialties !== undefined) user.specialties = updateUserDto.specialties;

    const updatedUser = await this.userRepository.save(user);
    console.log('✅ Usuario actualizado exitosamente en la BD:', updatedUser);

    return this.mapToResponseDto(updatedUser);
  }

  /**
   * 🗑️ Eliminar un usuario (eliminación lógica) en la BD
   *
   * Realiza una eliminación lógica cambiando status a INACTIVE.
   * No elimina físicamente el registro de la BD (soft delete).
   * Esto permite recuperar el usuario más tarde si es necesario.
   *
   * @param {number} id - ID del usuario a eliminar
   * @returns {Promise<UserResponseDto>} El usuario marcado como eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el usuario ya estaba eliminado
   *
   * @example
   * const usuarioEliminado = await usersService.remove(1);
   * console.log(usuarioEliminado.status); // UserStatus.INACTIVE
   *
   * // Para reactivar, usar update:
   * await usersService.update(1, { status: UserStatus.ACTIVE });
   */
  async remove(id: number): Promise<UserResponseDto> {
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

    if (user.status === UserStatus.INACTIVE) {
      throw new ConflictException(`Usuario con ID ${id} ya estaba eliminado`);
    }

    // Eliminación lógica: cambiar status a INACTIVE
    user.status = UserStatus.INACTIVE;
    const deletedUser = await this.userRepository.save(user);

    console.log('✅ Usuario eliminado exitosamente en la BD:', deletedUser);
    return this.mapToResponseDto(deletedUser);
  }

  /**
   * 🔄 Mapear UserEntity a UserResponseDto
   *
   * Convierte una entidad de usuario desde la BD al formato esperado por el frontend.
   * Este método asegura que la respuesta coincida exactamente con la interfaz del frontend.
   *
   * @param {UserEntity} user - La entidad de usuario desde la BD
   * @returns {UserResponseDto} El objeto formateado para el frontend
   *
   * @example
   * const userEntity = await this.userRepository.findOne({ where: { id: 1 } });
   * const userResponse = this.mapToResponseDto(userEntity);
   * console.log(userResponse.joinedDate); // '2024-01-15T10:30:00.000Z'
   */
  private mapToResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      joinedDate: user.getJoinedDate(), // Convierte createdAt a ISO string
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      specialties: user.specialties,
      stats: user.stats,
    };
  }
}
