import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../interfaces/user.interface';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, SearchUserDto } from '../dto/user.dto';

/**
 * 🏪 Servicio de usuarios - Lógica de negocio con Base de Datos
 * Ahora usa TypeORM Repository pattern para persistencia escalable
 * Compatible con SQLite, PostgreSQL, MySQL, etc.
 */
@Injectable()
export class UsersService {
  constructor(
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
    const count = await this.userRepository.count();

    if (count === 0) {
      console.log('🌱 Sembrando datos iniciales en la base de datos...');

      const initialUsers = [
        { name: 'Ana García', email: 'ana@email.com', age: 25, isActive: true },
        { name: 'Carlos López', email: 'carlos@email.com', age: 30, isActive: true },
        { name: 'María Rodríguez', email: 'maria@email.com', age: 28, isActive: false },
        { name: 'Juan Pérez', email: 'juan@email.com', age: 35, isActive: true },
      ];

      for (const userData of initialUsers) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      }

      console.log('✅ Datos iniciales creados exitosamente');
    }
  }

  /**
   * 📋 Obtener todos los usuarios activos desde la BD
   * @returns {Promise<User[]>} Lista de usuarios activos solamente
   */
  async findAll(): Promise<User[]> {
    console.log('📋 Obteniendo usuarios activos desde la base de datos...');

    const users = await this.userRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' }, // Más recientes primero
    });

    return this.mapEntitiesToInterfaces(users);
  }

  /**
   * 🔍 Buscar usuarios con filtros en la BD
   * @param {SearchUserDto} searchUserDto - Filtros de búsqueda
   * @returns {Promise<User[]>} Lista de usuarios filtrados
   */
  async search(searchUserDto: SearchUserDto): Promise<User[]> {
    console.log('🔍 Buscando usuarios con filtros en la BD:', searchUserDto);

    const whereConditions: Record<string, any> = {};

    // Filtrar por nombre (búsqueda parcial)
    if (searchUserDto.name) {
      whereConditions.name = Like(`%${searchUserDto.name}%`);
    }

    // Filtrar por email (búsqueda parcial)
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

    const users = await this.userRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
    });

    return this.mapEntitiesToInterfaces(users);
  }

  /**
   * 👤 Obtener un usuario por ID desde la BD
   * @param {number} id - ID del usuario
   * @returns {Promise<User>} Usuario encontrado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   */
  async findOne(id: number): Promise<User> {
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

    return this.mapEntityToInterface(user);
  }

  /**
   * ➕ Crear un nuevo usuario en la BD
   * @param {CreateUserDto} createUserDto - Datos del nuevo usuario
   * @returns {Promise<User>} Usuario creado
   * @throws {ConflictException} Si el email ya existe
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('➕ Creando nuevo usuario en la BD:', createUserDto);

    // Validar que el email no exista
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email ${createUserDto.email}`);
    }

    // Crear y guardar el nuevo usuario
    const user = this.userRepository.create({
      name: createUserDto.name.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      age: createUserDto.age,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    console.log('✅ Usuario creado exitosamente en la BD:', savedUser);
    return this.mapEntityToInterface(savedUser);
  }

  /**
   * ✏️ Actualizar un usuario existente en la BD
   * @param {number} id - ID del usuario a actualizar
   * @param {UpdateUserDto} updateUserDto - Datos a actualizar
   * @returns {Promise<User>} Usuario actualizado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el email ya existe en otro usuario
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    console.log(`✏️ Actualizando usuario ID ${id} en la BD:`, updateUserDto);

    // Validar ID
    if (isNaN(id)) {
      throw new BadRequestException('ID debe ser un número válido');
    }

    // Buscar el usuario
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

    // Actualizar campos proporcionados
    if (updateUserDto.name) user.name = updateUserDto.name.trim();
    if (updateUserDto.email) user.email = updateUserDto.email.toLowerCase().trim();
    if (updateUserDto.age !== undefined) user.age = updateUserDto.age;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;

    const updatedUser = await this.userRepository.save(user);

    console.log('✅ Usuario actualizado exitosamente en la BD:', updatedUser);
    return this.mapEntityToInterface(updatedUser);
  }

  /**
   * 🗑️ Eliminar un usuario (eliminación lógica) en la BD
   * @param {number} id - ID del usuario a eliminar
   * @returns {Promise<User>} Usuario eliminado
   * @throws {BadRequestException} Si el ID no es válido
   * @throws {NotFoundException} Si el usuario no existe
   * @throws {ConflictException} Si el usuario ya estaba eliminado
   */
  async remove(id: number): Promise<User> {
    console.log(`🗑️ Eliminando usuario ID ${id} en la BD`);

    // Validar ID
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

    // Eliminación lógica
    user.isActive = false;
    const deletedUser = await this.userRepository.save(user);

    console.log('✅ Usuario eliminado exitosamente en la BD:', deletedUser);
    return this.mapEntityToInterface(deletedUser);
  }

  /**
   * 🔄 Convertir UserEntity a User interface
   * @param {UserEntity} entity - Entity de la BD
   * @returns {User} Interface para el controlador
   */
  private mapEntityToInterface(entity: UserEntity): User {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      age: entity.age,
      isActive: entity.isActive,
    };
  }

  /**
   * 🔄 Convertir array de UserEntity a array de User interface
   * @param {UserEntity[]} entities - Array de entities de la BD
   * @returns {User[]} Array de interfaces para el controlador
   */
  private mapEntitiesToInterfaces(entities: UserEntity[]): User[] {
    return entities.map((entity) => this.mapEntityToInterface(entity));
  }
}
