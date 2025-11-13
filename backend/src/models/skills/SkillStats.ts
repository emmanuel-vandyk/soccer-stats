import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    Sequelize,
    NonAttribute
} from "sequelize";

import {BaseModel} from "../BaseModel";

export class SkillStats extends BaseModel<InferAttributes<SkillStats>, InferCreationAttributes<SkillStats>> {
    declare id: CreationOptional<number>;

    // Main
    declare pace: number | null;
    declare shooting: number | null;
    declare passing: number | null;
    declare dribbling: number | null;
    declare defending: number | null;
    declare physic: number | null;

    // Attacking
    declare attacking_crossing: number | null;
    declare attacking_finishing: number | null;
    declare attacking_heading_accuracy: number | null;
    declare attacking_short_passing: number | null;
    declare attacking_volleys: number | null;

    // Skill
    declare skill_dribbling: number | null;
    declare skill_curve: number | null;
    declare skill_fk_accuracy: number | null;
    declare skill_long_passing: number | null;
    declare skill_ball_control: number | null;

    // Movement
    declare movement_acceleration: number | null;
    declare movement_sprint_speed: number | null;
    declare movement_agility: number | null;
    declare movement_reactions: number | null;
    declare movement_balance: number | null;

    // Power
    declare power_shot_power: number | null;
    declare power_jumping: number | null;
    declare power_stamina: number | null;
    declare power_strength: number | null;
    declare power_long_shots: number | null;

    // Mentality
    declare mentality_aggression: number | null;
    declare mentality_interceptions: number | null;
    declare mentality_positioning: number | null;
    declare mentality_vision: number | null;
    declare mentality_penalties: number | null;
    declare mentality_composure: number | null;

    // Defending
    declare defending_marking_awareness: number | null;
    declare defending_standing_tackle: number | null;
    declare defending_sliding_tackle: number | null;

    // Goalkeeping
    declare goalkeeping_diving: number | null;
    declare goalkeeping_handling: number | null;
    declare goalkeeping_kicking: number | null;
    declare goalkeeping_positioning: number | null;
    declare goalkeeping_reflexes: number | null;
    declare goalkeeping_speed: number | null;

    // Timestamps
    declare readonly createdAt?: NonAttribute<Date>;
    declare readonly updatedAt?: NonAttribute<Date>;


    static initModel(sequelize: Sequelize): typeof SkillStats {
        SkillStats.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                    unique: true
                },

                pace: {type: DataTypes.TINYINT, allowNull: true},
                shooting: {type: DataTypes.TINYINT, allowNull: true},
                passing: {type: DataTypes.TINYINT, allowNull: true},
                dribbling: {type: DataTypes.TINYINT, allowNull: true},
                defending: {type: DataTypes.TINYINT, allowNull: true},
                physic: {type: DataTypes.TINYINT, allowNull: true},

                attacking_crossing: {type: DataTypes.TINYINT, allowNull: true},
                attacking_finishing: {type: DataTypes.TINYINT, allowNull: true},
                attacking_heading_accuracy: {type: DataTypes.TINYINT, allowNull: true},
                attacking_short_passing: {type: DataTypes.TINYINT, allowNull: true},
                attacking_volleys: {type: DataTypes.TINYINT, allowNull: true},

                skill_dribbling: {type: DataTypes.TINYINT, allowNull: true},
                skill_curve: {type: DataTypes.TINYINT, allowNull: true},
                skill_fk_accuracy: {type: DataTypes.TINYINT, allowNull: true},
                skill_long_passing: {type: DataTypes.TINYINT, allowNull: true},
                skill_ball_control: {type: DataTypes.TINYINT, allowNull: true},

                movement_acceleration: {type: DataTypes.TINYINT, allowNull: true},
                movement_sprint_speed: {type: DataTypes.TINYINT, allowNull: true},
                movement_agility: {type: DataTypes.TINYINT, allowNull: true},
                movement_reactions: {type: DataTypes.TINYINT, allowNull: true},
                movement_balance: {type: DataTypes.TINYINT, allowNull: true},

                power_shot_power: {type: DataTypes.TINYINT, allowNull: true},
                power_jumping: {type: DataTypes.TINYINT, allowNull: true},
                power_stamina: {type: DataTypes.TINYINT, allowNull: true},
                power_strength: {type: DataTypes.TINYINT, allowNull: true},
                power_long_shots: {type: DataTypes.TINYINT, allowNull: true},

                mentality_aggression: {type: DataTypes.TINYINT, allowNull: true},
                mentality_interceptions: {type: DataTypes.TINYINT, allowNull: true},
                mentality_positioning: {type: DataTypes.TINYINT, allowNull: true},
                mentality_vision: {type: DataTypes.TINYINT, allowNull: true},
                mentality_penalties: {type: DataTypes.TINYINT, allowNull: true},
                mentality_composure: {type: DataTypes.TINYINT, allowNull: true},

                defending_marking_awareness: {type: DataTypes.TINYINT, allowNull: true},
                defending_standing_tackle: {type: DataTypes.TINYINT, allowNull: true},
                defending_sliding_tackle: {type: DataTypes.TINYINT, allowNull: true},

                goalkeeping_diving: {type: DataTypes.TINYINT, allowNull: true},
                goalkeeping_handling: {type: DataTypes.TINYINT, allowNull: true},
                goalkeeping_kicking: {type: DataTypes.TINYINT, allowNull: true},
                goalkeeping_positioning: {type: DataTypes.TINYINT, allowNull: true},
                goalkeeping_reflexes: {type: DataTypes.TINYINT, allowNull: true},
                goalkeeping_speed: {type: DataTypes.TINYINT, allowNull: true},

                createdAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at'},
                updatedAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at'},
            },
            {
                sequelize,
                tableName: 'SkillStats',
                timestamps: false,
                underscored: false,
            }
        );
        return SkillStats;
    }
}