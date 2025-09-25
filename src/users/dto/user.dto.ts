import { IsString, IsEmail, IsNumber, Min, Max, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '../interfaces/user.interface';
import type { UserStats } from '../interfaces/user.interface';

/**
 * 📝 DTO para crear un nuevo usuario con validaciones automáticas
 * Define qué datos necesitamos para crear un usuario
 */
export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string; // 📛 Nombre (obligatorio, string no vacío)

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string; // 📧 Email (obligatorio, formato válido)

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser un valor válido' })
  role?: UserRole; // 🎭 Rol del usuario (opcional, por defecto: USER)

  @IsOptional()
  @IsUrl({}, { message: 'El avatar debe ser una URL válida' })
  avatar?: string; // 🖼️ URL del avatar (opcional)

  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  bio?: string; // 📝 Biografía (opcional)

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string; // 📞 Teléfono (opcional)

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser una cadena de texto' })
  location?: string; // 📍 Ubicación (opcional)

  @IsOptional()
  @IsArray({ message: 'Las especialidades deben ser un array' })
  @IsString({ each: true, message: 'Cada especialidad debe ser una cadena de texto' })
  specialties?: string[]; // 🎯 Especialidades (opcional)
}

/**
 * ✏️ DTO para actualizar un usuario existente con validaciones
 * Todos los campos son opcionales (puedes actualizar solo lo que quieras)
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string; // 📛 Nombre (opcional, si se envía debe ser string)

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string; // 📧 Email (opcional, si se envía debe ser email válido)

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser un valor válido' })
  role?: UserRole; // 🎭 Rol del usuario (opcional)

  @IsOptional()
  @IsUrl({}, { message: 'El avatar debe ser una URL válida' })
  avatar?: string; // 🖼️ URL del avatar (opcional)

  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado debe ser un valor válido' })
  status?: UserStatus; // 📊 Estado del usuario (opcional)

  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  bio?: string; // 📝 Biografía (opcional)

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string; // 📞 Teléfono (opcional)

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser una cadena de texto' })
  location?: string; // 📍 Ubicación (opcional)

  @IsOptional()
  @IsArray({ message: 'Las especialidades deben ser un array' })
  @IsString({ each: true, message: 'Cada especialidad debe ser una cadena de texto' })
  specialties?: string[]; // 🎯 Especialidades (opcional)
}

/**
 * 🔍 DTO para búsqueda de usuarios con validaciones
 * Define qué filtros podemos usar para buscar usuarios
 */
export class SearchUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string; // 📛 Nombre (opcional, si se envía debe ser string)

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string; // 📧 Email (opcional, si se envía debe ser email válido)

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser un valor válido' })
  role?: UserRole; // 🎭 Rol del usuario (opcional)

  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado debe ser un valor válido' })
  status?: UserStatus; // 📊 Estado del usuario (opcional)

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser una cadena de texto' })
  location?: string; // 📍 Ubicación (opcional)
}

/**
 * 📤 DTO de respuesta para usuarios
 * Define exactamente qué datos devolvemos al cliente
 * Coincide con la interfaz esperada por el frontend
 */
export class UserResponseDto {
  id: number; // 🆔 ID único del usuario
  name: string; // 📛 Nombre completo
  email: string; // 📧 Email
  role: UserRole; // 🎭 Rol del usuario
  avatar?: string; // 🖼️ URL de la foto de perfil (opcional)
  status: UserStatus; // 📊 Estado del usuario
  joinedDate: string; // 📅 Cuándo se unió al equipo (ISO string)
  bio?: string; // 📝 Biografía/descripción (opcional)
  phone?: string; // 📞 Teléfono (opcional)
  location?: string; // 📍 Ubicación (opcional)
  specialties?: string[]; // 🎯 Lista de especialidades (opcional)
  stats?: UserStats; // 📈 Estadísticas del usuario (opcional)
}
