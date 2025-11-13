// ============================================
// TYPE DEFINITIONS & INTERFACES
// Centralized types for the application
// ============================================

import { Request, RequestHandler, RequestParamHandler } from 'express';

// ==================== AUTH ====================
export interface AuthPayload {
    userId: number;
    email: string;
    role: boolean;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
}

// ==================== PLAYERS ====================
export interface PlayerFilters {
    name?: string;
    clubId?: number;
    clubName?: string;
    positionCode?: string;
    nationalityId?: number;
    leagueId?: number;
    fifaVersion?: number;
    overallMin?: number;
    overallMax?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface CreatePlayerDTO {
    id: number;
    externalPlayerId: number;
    shortName: string;
    longName?: string;
    nationalityId: number;
    dob?: Date;
    playerUrl?: string;
    playerFaceUrl?: string;
}

export interface UpdatePlayerDTO {
    shortName?: string;
    longName?: string;
    dob?: Date;
    playerUrl?: string;
    playerFaceUrl?: string;
}

export interface CreatePlayerVersionDTO {
    playerId: number;
    fifaVersion: number;
    fifaUpdate?: number;
    fifaUpdateDate?: Date;
    playerPositions?: string; // "ST, CF, LW"
    overall?: number;
    potential?: number;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    valueEur?: number;
    wageEur?: number;
    releaseClauseEur?: number;
    clubId?: number;
    clubPosition?: string;
    clubJerseyNumber?: number;
    clubJoinedDate?: Date;
    clubContractValidUntilYear?: number;
    nationTeamId?: number;
    nationPosition?: string;
    nationJerseyNumber?: number;
    preferredFoot?: string;
    weakFoot?: number;
    skillMoves?: number;
    internationalReputation?: number;
    workRate?: string;
    bodyType?: string;
    realFace?: boolean;
}

export interface UpdatePlayerVersionDTO extends Partial<CreatePlayerVersionDTO> {}

// ==================== SKILLS ====================
export interface SkillStatsDTO {
    // Main Stats
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physic?: number;

    // Attacking
    attackingCrossing?: number;
    attackingFinishing?: number;
    attackingHeadingAccuracy?: number;
    attackingShortPassing?: number;
    attackingVolleys?: number;

    // Skill
    skillDribbling?: number;
    skillCurve?: number;
    skillFkAccuracy?: number;
    skillLongPassing?: number;
    skillBallControl?: number;

    // Movement
    movementAcceleration?: number;
    movementSprintSpeed?: number;
    movementAgility?: number;
    movementReactions?: number;
    movementBalance?: number;

    // Power
    powerShotPower?: number;
    powerJumping?: number;
    powerStamina?: number;
    powerStrength?: number;
    powerLongShots?: number;

    // Mentality
    mentalityAggression?: number;
    mentalityInterceptions?: number;
    mentalityPositioning?: number;
    mentalityVision?: number;
    mentalityPenalties?: number;
    mentalityComposure?: number;

    // Defending
    defendingMarkingAwareness?: number;
    defendingStandingTackle?: number;
    defendingSlidingTackle?: number;

    // Goalkeeping
    goalkeepingDiving?: number;
    goalkeepingHandling?: number;
    goalkeepingKicking?: number;
    goalkeepingPositioning?: number;
    goalkeepingReflexes?: number;
    goalkeepingSpeed?: number;
}

export interface SkillTimelineQuery {
    skill: string; // e.g., "shooting", "pace"
}

export interface SkillTimelineDataPoint {
    fifaVersion: number;
    fifaUpdateDate: Date | null;
    value: number | null;
}

// ==================== EXPORT ====================
export interface ExportFilters extends PlayerFilters {
    format?: 'csv' | 'xlsx';
}