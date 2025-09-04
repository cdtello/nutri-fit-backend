import { IsString, IsEmail, IsNumber, Min, Max, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  @IsNumber({}, { message: 'La edad debe ser un número' })
  @Min(0, { message: 'La edad debe ser mayor o igual a 0' })
  @Max(150, { message: 'La edad debe ser menor o igual a 150' })
  age: number; // 🎂 Edad (obligatorio, 0-150)
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
  @IsNumber({}, { message: 'La edad debe ser un número' })
  @Min(0, { message: 'La edad debe ser mayor o igual a 0' })
  @Max(150, { message: 'La edad debe ser menor o igual a 150' })
  age?: number; // 🎂 Edad (opcional, si se envía debe estar entre 0-150)

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean; // ✅ Estado activo (opcional, debe ser booleano)
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
  @Type(() => Number)
  @IsNumber({}, { message: 'La edad debe ser un número' })
  @Min(0, { message: 'La edad debe ser mayor o igual a 0' })
  @Max(150, { message: 'La edad debe ser menor o igual a 150' })
  age?: number; // 🎂 Edad (opcional, se convierte automáticamente)

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean; // ✅ Estado activo (opcional, se convierte automáticamente)
}

// /**
//  * 📤 DTO de respuesta para usuarios - COMENTADO POR AHORA
//  * Define exactamente qué datos devolvemos al cliente
//  * (Ocultamos información sensible y agregamos campos calculados)
//  */
// export class UserResponseDto {
//   id: number; // 🆔 ID público
//   name: string; // 📛 Nombre público
//   email: string; // 📧 Email público
//   age: number; // 🎂 Edad pública
//   isActive: boolean; // ✅ Estado público

//   // 🧮 Campos calculados (no están en la interfaz original)
//   ageGroup: string; // Grupo etario calculado
//   displayName: string; // Nombre para mostrar

//   // 🚫 Campos que NO devolvemos:
//   // - password (si lo tuviéramos)
//   // - internalId (si lo tuviéramos)
//   // - createdAt (si lo tuviéramos)
//   // - lastLoginAt (información privada)
// }
