// src/services/admin-constants.ts

// Game Types
export const VALID_GAME_TYPES = ['TOP10', 'GRILLE', 'CLUB'] as const;
export type GameType = typeof VALID_GAME_TYPES[number];
export type GameTypeEnum = GameType;

// Difficulties
export const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = typeof VALID_DIFFICULTIES[number];

// Player Positions
export const VALID_POSITIONS = ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'] as const;
export type PlayerPosition = typeof VALID_POSITIONS[number];

// Nationalities
export const VALID_NATIONALITIES = [
  'France', 'Brazil', 'Argentina', 'Spain', 'England', 'Germany', 'Italy', 'Portugal',
  'Netherlands', 'Belgium', 'Poland', 'Croatia', 'Norway', 'Egypt', 'South Korea',
  'Nigeria', 'Canada', 'Morocco', 'Senegal', 'Algeria', 'Tunisia', 'Ivory Coast',
  'Ghana', 'Cameroon', 'Mali', 'Burkina Faso', 'Guinea', 'Togo', 'Congo',
  'DR Congo', 'Central African Republic', 'Chad', 'Niger', 'Gabon',
  'Equatorial Guinea', 'São Tomé and Príncipe', 'Cape Verde', 'Guinea-Bissau',
  'Liberia', 'Sierra Leone', 'Gambia', 'Mauritania', 'Mauritius', 'Seychelles',
  'Comoros', 'Madagascar', 'Malawi', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia',
  'South Africa', 'Lesotho', 'Swaziland', 'Mozambique', 'Tanzania', 'Kenya',
  'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia',
  'Sudan', 'South Sudan', 'Libya', 'Lebanon', 'Syria', 'Jordan', 'Israel',
  'Palestine', 'Saudi Arabia', 'Yemen', 'Oman', 'UAE', 'Qatar', 'Bahrain',
  'Kuwait', 'Iraq', 'Iran', 'Turkey', 'Cyprus', 'Greece', 'Albania',
  'North Macedonia', 'Bulgaria', 'Romania', 'Moldova', 'Ukraine', 'Belarus',
  'Lithuania', 'Latvia', 'Estonia', 'Russia', 'Georgia', 'Armenia', 'Azerbaijan',
  'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan',
  'Afghanistan', 'Pakistan', 'India', 'Bangladesh', 'Sri Lanka', 'Maldives',
  'Nepal', 'Bhutan', 'Myanmar', 'Thailand', 'Laos', 'Vietnam', 'Cambodia',
  'Malaysia', 'Singapore', 'Indonesia', 'Brunei', 'Philippines', 'Taiwan',
  'Hong Kong', 'Macau', 'China', 'Mongolia', 'North Korea', 'Japan',
  'Australia', 'New Zealand', 'United States', 'Mexico', 'Guatemala', 'Belize',
  'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba',
  'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Venezuela',
  'Colombia', 'Guyana', 'Suriname', 'French Guiana', 'Ecuador', 'Peru',
  'Bolivia', 'Paraguay', 'Uruguay', 'Chile'
] as const;
export type Nationality = typeof VALID_NATIONALITIES[number];

// Limits
export const LIMITS = {
  MIN_TIME_LIMIT: 30,
  MAX_TIME_LIMIT: 3600,
  MIN_MAX_PLAYERS: 1,
  MAX_MAX_PLAYERS: 15,
  MIN_MAX_ATTEMPTS: 1,
  MAX_MAX_ATTEMPTS: 10,
  MIN_GRID_SIZE: 2,
  MAX_GRID_SIZE: 5,
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Validation errors
  INVALID_GAME_TYPE: 'Type de jeu invalide',
  INVALID_DIFFICULTY: 'Niveau de difficulté invalide',
  INVALID_POSITION: 'Position invalide',
  INVALID_NATIONALITY: 'Nationalité invalide',
  INVALID_TIME_LIMIT: 'Limite de temps invalide',
  INVALID_MAX_PLAYERS: 'Nombre maximum de joueurs invalide',
  INVALID_MAX_ATTEMPTS: 'Nombre maximum de tentatives invalide',
  INVALID_GRID_SIZE: 'Taille de grille invalide',
  VALIDATION_ERROR: 'Erreur de validation',
  
  // Not found errors
  GAME_TYPE_NOT_FOUND: 'Type de jeu non trouvé',
  CONFIGURATION_NOT_FOUND: 'Configuration de jeu non trouvée',
  RULES_NOT_FOUND: 'Règles de jeu non trouvées',
  PLAYER_NOT_FOUND: 'Joueur non trouvé',
  QUESTION_NOT_FOUND: 'Question non trouvée',
  
  // Duplicate errors
  DUPLICATE_PLAYER: 'Joueur déjà existant',
  
  // Database errors
  DATABASE_ERROR: 'Erreur de base de données',
  IMPORT_ERROR: 'Erreur lors de l\'importation',
  EXPORT_ERROR: 'Erreur lors de l\'exportation'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PLAYER_CREATED: 'Joueur créé avec succès',
  PLAYER_UPDATED: 'Joueur mis à jour avec succès',
  PLAYER_DELETED: 'Joueur supprimé avec succès',
  PLAYER_ARCHIVED: 'Joueur archivé avec succès',
  PLAYER_VERIFIED: 'Joueur vérifié avec succès',
  GAME_TYPE_CREATED: 'Type de jeu créé avec succès',
  GAME_TYPE_UPDATED: 'Type de jeu mis à jour avec succès',
  GAME_TYPE_DELETED: 'Type de jeu supprimé avec succès',
  QUESTION_CREATED: 'Question créée avec succès',
  QUESTION_UPDATED: 'Question mise à jour avec succès',
  QUESTION_DELETED: 'Question supprimée avec succès',
  QUESTION_ARCHIVED: 'Question archivée avec succès'
} as const;

// Database Table Names
export const TABLES = {
  GAME_TYPES: 'game_types',
  GAME_CONFIGURATIONS: 'game_configurations',
  GAME_RULES: 'game_rules',
  PLAYERS: 'players',
  QUESTIONS: 'questions',
  QUESTION_ANSWERS: 'question_answers',
  GRID_CONFIGS: 'grid_configs',
  GRID_ANSWERS: 'grid_answers',
  GAME_RESULTS: 'game_results'
} as const;

// Common Query Options
export const QUERY_OPTIONS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_ORDER: { ascending: false },
  DEFAULT_SELECT: '*'
} as const;
