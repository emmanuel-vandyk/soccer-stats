// ============================================
// SKILL STATS SERVICE
// Handles skill statistics and timeline queries
// ============================================

import { PlayerVersion } from '../../models/player/PlayerVersion';
import { SkillStats } from '../../models/skills/SkillStats';
import { Player } from '../../models/player/Player';
import { SkillTimelineDataPoint } from '../../types';
import { NotFoundError, ValidationError } from '../../utils/CustomErrors';

export class SkillStatsService {
  // Valid skill attribute names
  private readonly VALID_SKILLS = [
    // Main Stats
    'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
    // Attacking
    'attackingCrossing', 'attackingFinishing', 'attackingHeadingAccuracy',
    'attackingShortPassing', 'attackingVolleys',
    // Skill
    'skillDribbling', 'skillCurve', 'skillFkAccuracy',
    'skillLongPassing', 'skillBallControl',
    // Movement
    'movementAcceleration', 'movementSprintSpeed', 'movementAgility',
    'movementReactions', 'movementBalance',
    // Power
    'powerShotPower', 'powerJumping', 'powerStamina',
    'powerStrength', 'powerLongShots',
    // Mentality
    'mentalityAggression', 'mentalityInterceptions', 'mentalityPositioning',
    'mentalityVision', 'mentalityPenalties', 'mentalityComposure',
    // Defending
    'defendingMarkingAwareness', 'defendingStandingTackle', 'defendingSlidingTackle',
    // Goalkeeping
    'goalkeepingDiving', 'goalkeepingHandling', 'goalkeepingKicking',
    'goalkeepingPositioning', 'goalkeepingReflexes', 'goalkeepingSpeed'
  ];

  /**
   * Get skill evolution timeline for a specific player and skill
   */
async getSkillTimeline(
  playerId: number,
  skillName: string
  ): Promise<SkillTimelineDataPoint[]> {
    // Validate player exists
    const player = await Player.findByPk(playerId);
    if (!player) {
      throw new NotFoundError('Player', playerId);
    }

    // Validate skill name
    if (!this.isValidSkill(skillName)) {
      throw new ValidationError(
        `Invalid skill name: ${skillName}. Valid skills: ${this.VALID_SKILLS.join(', ')}`
      );
    }

    // Get all versions with skill stats
    const versions = await PlayerVersion.findAll({
      where: { player_id: playerId },
      include: [
        {
          model: SkillStats,  
          as: 'skillSet',
          attributes: ['id', this.convertToSnakeCase(skillName)]
        }
      ],
      order: [['fifaVersion', 'ASC'], ['fifaUpdate', 'ASC']],
      attributes: ['id', 'fifaVersion', 'fifaUpdate', 'fifaUpdateDate']
    });

    // Map to timeline data points
    const timeline: SkillTimelineDataPoint[] = versions.map((version: any) => ({
      fifaVersion: version.fifaVersion,
      fifaUpdateDate: version.fifaUpdateDate,
      value: version.skillSet ? version.skillSet[this.convertToSnakeCase(skillName)] : null
    }));

    return timeline;
  }

  /**
   * Get all skills for a specific player version (for radar chart)
   */
  async getSkillsForVersion(playerVersionId: number): Promise<any> {
    const version = await PlayerVersion.findByPk(playerVersionId, {
      include: [
        {
          model: SkillStats,
          as: 'skillSet'
        }
      ]
    });

    if (!version) {
      throw new NotFoundError('PlayerVersion', playerVersionId);
    }

    if (!version.skill_set_id) {
      throw new NotFoundError('SkillStats for PlayerVersion', playerVersionId);
    }

    return version.skill_set_id;
  }

  /**
   * Get main stats for radar chart (pace, shooting, passing, dribbling, defending, physic)
   */
  async getMainStatsForRadar(playerVersionId: number): Promise<{
    labels: string[];
    values: number[];
  }> {
    const skillSet = await this.getSkillsForVersion(playerVersionId);

    const mainStats = [
      { label: 'Pace', value: skillSet.pace || 0 },
      { label: 'Shooting', value: skillSet.shooting || 0 },
      { label: 'Passing', value: skillSet.passing || 0 },
      { label: 'Dribbling', value: skillSet.dribbling || 0 },
      { label: 'Defending', value: skillSet.defending || 0 },
      { label: 'Physical', value: skillSet.physic || 0 }
    ];

    return {
      labels: mainStats.map(s => s.label),
      values: mainStats.map(s => s.value)
    };
  }

  /**
   * Validate if skill name is valid
   */
  private isValidSkill(skillName: string): boolean {
    return this.VALID_SKILLS.includes(skillName);
  }

  /**
   * Convert camelCase to snake_case for database fields
   */
  private convertToSnakeCase(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Get all valid skill names
   */
  getValidSkills(): string[] {
    return [...this.VALID_SKILLS];
  }
}