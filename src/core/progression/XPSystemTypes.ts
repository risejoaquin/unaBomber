// src/core/progression/XPSystemTypes.ts

// --- 🎮 1. SISTEMA DE XP: VALORES BALANCEADOS ---
export const XP_VALUES = {
    BLOCK_WEAK_DESTROYED: 5,
    ENEMY_KILLED: 30, // Básico
    ENEMY_HARD_KILLED: 75, // Fuerte (Futuro)
    ITEM_COLLECTED: 10,
    CHAIN_HIT_BONUS: 5, // Por entidad después de la primera
    SURVIVE_MINUTE: 20, // Anti-AFK
    LEVEL_CLEARED: 250,
    GAME_PERFECT_BONUS: 150, // Cero muertes
    BOMB_PLACED: 0, // No da XP directamente
    MOVEMENT_INPUT: 0, // No da XP, solo se usa para Anti-AFK
};

// --- ⚙️ 3. ARQUITECTURA: TIPOS DE EVENTOS ---
export type ActionType = keyof typeof XP_VALUES;

export interface GameAction {
    type: ActionType;
    timestamp: number; // Tiempo absoluto del evento (para Anti-Spam)
    data?: { // Datos contextuales para validación del servidor
        entityId?: string;
        gridX?: number;
        gridY?: number;
    };
}

export interface PlayerSessionData {
    actions: GameAction[];
    sessionDurationSeconds: number;
    deaths: number;
}

// --- 🏆 4. LEADERBOARD PROFESIONAL: TIPOS DE DATOS ---
export interface LeaderboardEntry {
    uid: string;
    username: string;
    totalXP: number;
    level: number;
}