/**
 * 🏛️ Entity de Usuario
 * Representa la estructura de la tabla de usuarios en la base de datos
 * Esta clase define cómo se almacenan los datos en la BD
 */
export class UserEntity {
  /**
   * 🆔 Identificador único del usuario
   * Clave primaria, auto-incremental
   */
  id: number;

  /**
   * 📛 Nombre completo del usuario
   * Campo obligatorio, máximo 100 caracteres
   */
  name: string;

  /**
   * 📧 Correo electrónico del usuario
   * Campo único y obligatorio, máximo 255 caracteres
   */
  email: string;

  /**
   * 🎂 Edad del usuario
   * Campo obligatorio, rango válido: 0-150
   */
  age: number;

  /**
   * ✅ Estado activo del usuario
   * true = activo, false = inactivo/eliminado
   * Por defecto: true
   */
  isActive: boolean;

  /**
   * 📅 Fecha de creación del registro
   * Se asigna automáticamente al crear el usuario
   */
  createdAt: Date;

  /**
   * 🔄 Fecha de última actualización
   * Se actualiza automáticamente al modificar el usuario
   */
  updatedAt: Date;

  /**
   * 🏗️ Constructor de la entity
   * Permite crear una instancia con valores iniciales
   */
  constructor(partial: Partial<UserEntity> = {}) {
    Object.assign(this, partial);

    // Valores por defecto si no se proporcionan
    this.isActive = this.isActive ?? true;
    this.createdAt = this.createdAt ?? new Date();
    this.updatedAt = this.updatedAt ?? new Date();
  }

  /**
   * 🔄 Método para actualizar la fecha de modificación
   * Se debe llamar antes de guardar cambios
   */
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  /**
   * 📊 Método para calcular el grupo etario
   * Lógica de negocio que puede ser útil en la entity
   */
  getAgeGroup(): string {
    if (this.age < 18) return 'Menor de edad';
    if (this.age < 30) return 'Joven adulto';
    if (this.age < 50) return 'Adulto';
    if (this.age < 65) return 'Adulto mayor';
    return 'Tercera edad';
  }

  /**
   * 📛 Método para obtener el nombre formateado
   * Convierte el nombre a formato título (Primera Letra Mayúscula)
   */
  getDisplayName(): string {
    return this.name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * ✅ Método para activar el usuario
   */
  activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  /**
   * ❌ Método para desactivar el usuario (eliminación lógica)
   */
  deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  /**
   * 🔍 Método para verificar si el usuario está activo
   */
  isUserActive(): boolean {
    return this.isActive;
  }
}
