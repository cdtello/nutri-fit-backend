/**
 * 🎭 Enumeración de roles de usuario
 * Define los diferentes tipos de usuario en el sistema
 */
export enum UserRole {
  ADMIN = 'admin', // 👑 Administrador del sistema
  TRAINER = 'trainer', // 🏋️ Entrenador personal
  NUTRITIONIST = 'nutritionist', // 🥗 Nutricionista
  USER = 'user', // 👤 Usuario regular
  GUEST = 'guest', // 👥 Usuario invitado
}

/**
 * 📊 Enumeración de estados de usuario
 * Define los diferentes estados que puede tener un usuario
 */
export enum UserStatus {
  ACTIVE = 'active', // ✅ Usuario activo
  INACTIVE = 'inactive', // 😴 Usuario inactivo
  PENDING = 'pending', // ⏳ Pendiente de activación
  SUSPENDED = 'suspended', // ⛔ Usuario suspendido
  BANNED = 'banned', // 🚫 Usuario baneado
}

/**
 * 📈 Interface para estadísticas del usuario
 * Contiene métricas y datos de actividad del usuario
 */
export interface UserStats {
  totalWorkouts: number; // 🏋️ Total de entrenamientos completados
  currentStreak: number; // 🔥 Racha actual de días seguidos
  longestStreak: number; // 🏆 Racha más larga alcanzada
  totalCaloriesBurned: number; // 🔥 Total de calorías quemadas
  averageWorkoutDuration: number; // ⏱️ Duración promedio de entrenamientos (minutos)
  favoriteWorkoutType?: string; // ❤️ Tipo de entrenamiento favorito
  monthlyGoal: number; // 🎯 Meta mensual de entrenamientos
  monthlyProgress: number; // 📊 Progreso actual del mes (0-100%)
}

/**
 * 👤 Interface completa del usuario para el frontend
 * Coincide exactamente con la interfaz esperada por el frontend
 */
export interface User {
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
