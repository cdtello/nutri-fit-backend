/**
 * 🏋️ Interfaz que define cómo debe ser un día de entrenamiento
 * Una interfaz es como un "molde" que nos dice qué propiedades debe tener
 */
export interface WorkoutDay {
  id: number; // 🆔 Identificador único
  name: string; // 📛 Nombre del entrenamiento
  description?: string; // 📝 Descripción opcional del entrenamiento
  dayOfWeek: number; // 🗓️ Día de la semana (1-7)
  durationMinutes: number; // ⏱️ Duración en minutos
  intensityLevel: number; // 🔥 Nivel de intensidad (1-5)
  workoutType: string; // 🎯 Tipo de entrenamiento
  isActive: boolean; // ✅ ¿Está activo el día de entrenamiento?
  userId: number; // 👤 ID del usuario propietario
}
