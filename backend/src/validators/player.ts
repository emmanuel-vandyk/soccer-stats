// ============================================
// PLAYER VALIDATORS
// Express-validator rules for player operations
// ============================================

import { body, param, query } from 'express-validator';

export const createPlayerValidators = [
  body('shortName')
    .notEmpty()
    .withMessage('Short name is required')
    .isLength({ max: 100 })
    .withMessage('Short name must be less than 100 characters')
    .trim(),
  
  body('longName')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Long name must be less than 255 characters')
    .trim(),
  
  body('nationalityId')
    .notEmpty()
    .withMessage('Nationality ID is required')
    .isInt({ min: 1 })
    .withMessage('Nationality ID must be a positive integer'),
  
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('playerUrl')
    .optional()
    .isURL()
    .withMessage('Player URL must be a valid URL'),
  
  body('playerFaceUrl')
    .optional()
    .isURL()
    .withMessage('Player face URL must be a valid URL')
];

export const updatePlayerValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Player ID must be a positive integer'),
  
  body('player.shortName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Short name must be less than 100 characters')
    .trim(),
  
  body('player.longName')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Long name must be less than 255 characters')
    .trim(),
  
  body('version.overall')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Overall must be between 0 and 100'),
  
  body('version.potential')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Potential must be between 0 and 100'),
  
  body('version.age')
    .optional()
    .isInt({ min: 15, max: 50 })
    .withMessage('Age must be between 15 and 50'),
  
  body('version.heightCm')
    .optional()
    .isInt({ min: 150, max: 220 })
    .withMessage('Height must be between 150 and 220 cm'),
  
  body('version.weightKg')
    .optional()
    .isInt({ min: 40, max: 120 })
    .withMessage('Weight must be between 40 and 120 kg'),
  
  body('skills.pace')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Pace must be between 0 and 100'),
  
  body('skills.shooting')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Shooting must be between 0 and 100'),
  
  body('skills.passing')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing must be between 0 and 100'),
  
  body('skills.dribbling')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Dribbling must be between 0 and 100'),
  
  body('skills.defending')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Defending must be between 0 and 100'),
  
  body('skills.physic')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Physical must be between 0 and 100')
];

export const playerIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Player ID must be a positive integer')
];

export const playerQueryValidators = [
  query('name')
    .optional()
    .isString()
    .trim(),
  
  query('clubId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Club ID must be a positive integer'),
  
  query('clubName')
    .optional()
    .isString()
    .trim(),
  
  query('positionCode')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .withMessage('Position code must be less than 10 characters'),
  
  query('nationalityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Nationality ID must be a positive integer'),
  
  query('leagueId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('League ID must be a positive integer'),
  
  query('fifaVersion')
    .optional()
    .isInt({ min: 15, max: 30 })
    .withMessage('FIFA version must be between 15 and 30'),
  
  query('overallMin')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Overall min must be between 0 and 100'),
  
  query('overallMax')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Overall max must be between 0 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .isIn(['overall', 'potential', 'age', 'valueEur', 'shortName'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isString()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

export const skillTimelineValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Player ID must be a positive integer'),
  
  query('skill')
    .notEmpty()
    .withMessage('Skill parameter is required')
    .isString()
    .withMessage('Skill must be a string')
];