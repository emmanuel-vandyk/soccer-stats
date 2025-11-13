import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";
import { BaseModel } from "../BaseModel";

/**
 * FifaPlayer model - represents the FIFA player data from the SQL dump
 * This is a complete FIFA player record with all stats and attributes
 */

const { STRING, INTEGER, ENUM } = DataTypes;

export class FifaPlayer extends BaseModel<InferAttributes<FifaPlayer>, InferCreationAttributes<FifaPlayer>> {
  // Primary Key
  declare id: CreationOptional<number>;

  // FIFA Version Info
  declare fifa_version: string;
  declare fifa_update: string;
  declare gender: 'M' | 'F'; // M = Male, F = Female

  // Basic Player Info
  declare player_face_url: string;
  declare long_name: string;
  declare short_name: string;
  declare player_positions: string;
  declare club_name: string | null;
  declare nationality_name: string | null;

  // Overall Stats
  declare overall: number;
  declare potential: number;
  declare value_eur: number | null;
  declare wage_eur: number | null;
  declare age: number;

  // Physical Attributes
  declare height_cm: number | null;
  declare weight_kg: number | null;
  declare preferred_foot: string | null;

  // Skills
  declare weak_foot: number | null;
  declare skill_moves: number | null;
  declare international_reputation: number | null;
  declare work_rate: string | null;
  declare body_type: string | null;

  // Main Stats (Face Stats)
  declare pace: number | null;
  declare shooting: number | null;
  declare passing: number | null;
  declare dribbling: number | null;
  declare defending: number | null;
  declare physic: number | null;

  // Attacking Stats
  declare attacking_crossing: number | null;
  declare attacking_finishing: number | null;
  declare attacking_heading_accuracy: number | null;
  declare attacking_short_passing: number | null;
  declare attacking_volleys: number | null;

  // Skill Stats
  declare skill_dribbling: number | null;
  declare skill_curve: number | null;
  declare skill_fk_accuracy: number | null;
  declare skill_long_passing: number | null;
  declare skill_ball_control: number | null;

  // Movement Stats
  declare movement_acceleration: number | null;
  declare movement_sprint_speed: number | null;
  declare movement_agility: number | null;
  declare movement_reactions: number | null;
  declare movement_balance: number | null;

  // Power Stats
  declare power_shot_power: number | null;
  declare power_jumping: number | null;
  declare power_stamina: number | null;
  declare power_strength: number | null;
  declare power_long_shots: number | null;

  // Mentality Stats
  declare mentality_aggression: number | null;
  declare mentality_interceptions: number | null;
  declare mentality_positioning: number | null;
  declare mentality_vision: number | null;
  declare mentality_penalties: number | null;
  declare mentality_composure: number | null;

  // Defending Stats
  declare defending_marking: number | null;
  declare defending_standing_tackle: number | null;
  declare defending_sliding_tackle: number | null;

  // Goalkeeping Stats
  declare goalkeeping_diving: number | null;
  declare goalkeeping_handling: number | null;
  declare goalkeeping_kicking: number | null;
  declare goalkeeping_positioning: number | null;
  declare goalkeeping_reflexes: number | null;
  declare goalkeeping_speed: number | null;

  // Player Traits
  declare player_traits: string | null;

  static initModel(sequelize: Sequelize): typeof FifaPlayer {
    FifaPlayer.init(
      {
        id: {
          type: INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        fifa_version: {
          type: STRING(255),
          allowNull: false,
          comment: 'FIFA version (16, 17, 18, etc.)',
        },
        fifa_update: {
          type: STRING(255),
          allowNull: false,
          comment: 'Update number within the FIFA version',
        },
        gender: {
          type: ENUM('M', 'F'),
          allowNull: false,
          comment: 'Player gender: M = Male, F = Female',
        },
        player_face_url: {
          type: STRING(255),
          allowNull: false,
        },
        long_name: {
          type: STRING(255),
          allowNull: false,
        },
        short_name: {
          type: STRING(255),
          allowNull: false,
        },
        player_positions: {
          type: STRING(255),
          allowNull: false,
          comment: 'Comma-separated list of positions (e.g., "ST, CF")',
        },
        club_name: {
          type: STRING(255),
          allowNull: true,
        },
        nationality_name: {
          type: STRING(255),
          allowNull: true,
        },
        overall: {
          type: INTEGER,
          allowNull: false,
          comment: 'Overall rating (1-99)',
        },
        potential: {
          type: INTEGER,
          allowNull: false,
          comment: 'Potential rating (1-99)',
        },
        value_eur: {
          type: INTEGER,
          allowNull: true,
          comment: 'Market value in EUR',
        },
        wage_eur: {
          type: INTEGER,
          allowNull: true,
          comment: 'Weekly wage in EUR',
        },
        age: {
          type: INTEGER,
          allowNull: false,
        },
        height_cm: {
          type: INTEGER,
          allowNull: true,
        },
        weight_kg: {
          type: INTEGER,
          allowNull: true,
        },
        preferred_foot: {
          type: STRING(255),
          allowNull: true,
        },
        weak_foot: {
          type: INTEGER,
          allowNull: true,
          comment: '1-5 stars',
        },
        skill_moves: {
          type: INTEGER,
          allowNull: true,
          comment: '1-5 stars',
        },
        international_reputation: {
          type: INTEGER,
          allowNull: true,
          comment: '1-5 stars',
        },
        work_rate: {
          type: STRING(255),
          allowNull: true,
          comment: 'e.g., "High/Medium"',
        },
        body_type: {
          type: STRING(255),
          allowNull: true,
        },
        pace: {
          type: INTEGER,
          allowNull: true,
        },
        shooting: {
          type: INTEGER,
          allowNull: true,
        },
        passing: {
          type: INTEGER,
          allowNull: true,
        },
        dribbling: {
          type: INTEGER,
          allowNull: true,
        },
        defending: {
          type: INTEGER,
          allowNull: true,
        },
        physic: {
          type: INTEGER,
          allowNull: true,
        },
        attacking_crossing: {
          type: INTEGER,
          allowNull: true,
        },
        attacking_finishing: {
          type: INTEGER,
          allowNull: true,
        },
        attacking_heading_accuracy: {
          type: INTEGER,
          allowNull: true,
        },
        attacking_short_passing: {
          type:  INTEGER,
          allowNull: true,
        },
        attacking_volleys: {
          type: INTEGER,
          allowNull: true,
        },
        skill_dribbling: {
          type: INTEGER,
          allowNull: true,
        },
        skill_curve: {
          type: INTEGER,
          allowNull: true,
        },
        skill_fk_accuracy: {
          type: INTEGER,
          allowNull: true,
        },
        skill_long_passing: {
          type: INTEGER,
          allowNull: true,
        },
        skill_ball_control: {
          type: INTEGER,
          allowNull: true,
        },
        movement_acceleration: {
          type: INTEGER,
          allowNull: true,
        },
        movement_sprint_speed: {
          type: INTEGER,
          allowNull: true,
        },
        movement_agility: {
          type: INTEGER,
          allowNull: true,
        },
        movement_reactions: {
          type: INTEGER,
          allowNull: true,
        },
        movement_balance: {
          type: INTEGER,
          allowNull: true,
        },
        power_shot_power: {
          type: INTEGER,
          allowNull: true,
        },
        power_jumping: {
          type: INTEGER,
          allowNull: true,
        },
        power_stamina: {
          type: INTEGER,
          allowNull: true,
        },
        power_strength: {
          type: INTEGER,
          allowNull: true,
        },
        power_long_shots: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_aggression: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_interceptions: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_positioning: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_vision: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_penalties: {
          type: INTEGER,
          allowNull: true,
        },
        mentality_composure: {
          type: INTEGER,
          allowNull: true,
        },
        defending_marking: {
          type: INTEGER,
          allowNull: true,
        },
        defending_standing_tackle: {
          type: INTEGER,
          allowNull: true,
        },
        defending_sliding_tackle: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_diving: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_handling: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_kicking: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_positioning: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_reflexes: {
          type: INTEGER,
          allowNull: true,
        },
        goalkeeping_speed: {
          type: INTEGER,
          allowNull: true,
        },
        player_traits: {
          type: STRING(255),
          allowNull: true,
          comment: 'Comma-separated list of player traits',
        },
      },
      {
        sequelize,
        tableName: 'players',
        timestamps: false, // No createdAt/updatedAt in this table
        indexes: [
          { fields: ['fifa_version', 'fifa_update'], name: 'idx_fifa_version_update' },
          { fields: ['gender'], name: 'idx_gender' },
          { fields: ['long_name'], name: 'idx_long_name' },
          { fields: ['nationality_name'], name: 'idx_nationality' },
          { fields: ['club_name'], name: 'idx_club' },
          { fields: ['overall'], name: 'idx_overall' },
          { fields: ['player_positions'], name: 'idx_positions' },
        ],
      }
    );

    return FifaPlayer;
  }

  // No associations needed for this table (it's standalone from the dump)
  static associate() {
    // This table doesn't have foreign keys in the dump
  }
}
