/**
 * 👤 Interfaz que define cómo debe ser un usuario
 * Una interfaz es como un "molde" que nos dice qué propiedades debe tener
 */
export interface User {
  id: number; // 🆔 Identificador único
  name: string; // 📛 Nombre completo
  email: string; // 📧 Correo electrónico
  age: number; // 🎂 Edad
  isActive: boolean; // ✅ ¿Está activo el usuario?
}
