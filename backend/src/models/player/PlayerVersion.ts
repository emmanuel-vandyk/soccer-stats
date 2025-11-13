import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey, NonAttribute } from "sequelize";
import { BaseModel } from "../BaseModel";
import { SkillStats } from "../skills/SkillStats";
export class PlayerVersion extends BaseModel<InferAttributes<PlayerVersion, { omit: never }>, InferCreationAttributes<PlayerVersion>> {
  declare id: CreationOptional<number>;
  declare player_id: ForeignKey<number>;
  declare skill_set_id: ForeignKey<number> | null;

  // FIFA Version Info
  declare fifa_version: number;
  declare fifa_update: number | null;
  declare fifa_update_date: Date | null;

  // Basic Stats
  declare player_positions: string | null;
  declare overall: number | null;
  declare potential: number | null;
  declare age: number | null;
  declare height_cm: number | null;
  declare weight_kg: number | null;

  // Financial
  declare value_eur: bigint | number | null;
  declare wage_eur: bigint | number | null;
  declare release_clause_eur: bigint | number | null;

  // Club Info
  declare club_id: ForeignKey<number> | null;
  declare club_position: string | null;
  declare club_jersey_number: number | null;
  declare club_loaned_from: string | null;
  declare club_joined_date: Date | null;
  declare club_contract_valid_until_year: number | null;

  // National Team Info
  declare nation_team_id: ForeignKey<number> | null;
  declare nation_position: string | null;
  declare nation_jersey_number: number | null;

  // Associations
  declare skillSet?: NonAttribute<SkillStats>;

  // Playing Style
  declare preferred_foot: string | null;
  declare weak_foot: number | null;
  declare skill_moves: number | null;
  declare international_reputation: number | null;
  declare work_rate: string | null;
  declare body_type: string | null;
  declare real_face: CreationOptional<boolean>;

  // Position Ratings
  declare ls: string | null; declare st: string | null; declare rs: string | null; declare lw: string | null; declare lf: string | null; declare cf: string | null; declare rf: string | null; declare rw: string | null; declare lam: string | null; declare cam: string | null; declare ram: string | null; declare lm: string | null; declare lcm: string | null; declare cm: string | null; declare rcm: string | null; declare rm: string | null; declare lwb: string | null; declare ldm: string | null; declare cdm: string | null; declare rdm: string | null; declare rwb: string | null; declare lb: string | null; declare lcb: string | null; declare cb: string | null; declare rcb: string | null; declare rb: string | null; declare gk: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PlayerVersion {
    PlayerVersion.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
        player_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        skill_set_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

        fifa_version: { type: DataTypes.SMALLINT, allowNull: false },
        fifa_update: { type: DataTypes.SMALLINT, allowNull: true },
        fifa_update_date: { type: DataTypes.DATEONLY, allowNull: true },

        player_positions: { type: DataTypes.STRING(100), allowNull: true },
        overall: { type: DataTypes.TINYINT, allowNull: true },
        potential: { type: DataTypes.TINYINT, allowNull: true },
        age: { type: DataTypes.TINYINT, allowNull: true },
        height_cm: { type: DataTypes.SMALLINT, allowNull: true },
        weight_kg: { type: DataTypes.SMALLINT, allowNull: true },

        value_eur: { type: DataTypes.BIGINT, allowNull: true },
        wage_eur: { type: DataTypes.BIGINT, allowNull: true },
        release_clause_eur: { type: DataTypes.BIGINT, allowNull: true },

        club_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        club_position: { type: DataTypes.STRING(50), allowNull: true },
        club_jersey_number: { type: DataTypes.TINYINT, allowNull: true },
        club_loaned_from: { type: DataTypes.STRING(255), allowNull: true },
        club_joined_date: { type: DataTypes.DATEONLY, allowNull: true },
        club_contract_valid_until_year: { type: DataTypes.SMALLINT, allowNull: true },

        nation_team_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        nation_position: { type: DataTypes.STRING(50), allowNull: true },
        nation_jersey_number: { type: DataTypes.TINYINT, allowNull: true },

        preferred_foot: { type: DataTypes.STRING(10), allowNull: true },
        weak_foot: { type: DataTypes.TINYINT, allowNull: true },
        skill_moves: { type: DataTypes.TINYINT, allowNull: true },
        international_reputation: { type: DataTypes.TINYINT, allowNull: true },
        work_rate: { type: DataTypes.STRING(50), allowNull: true },
        body_type: { type: DataTypes.STRING(50), allowNull: true },
        real_face: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

        ls: { type: DataTypes.STRING(10), allowNull: true },
        st: { type: DataTypes.STRING(10), allowNull: true },
        rs: { type: DataTypes.STRING(10), allowNull: true },
        lw: { type: DataTypes.STRING(10), allowNull: true },
        lf: { type: DataTypes.STRING(10), allowNull: true },
        cf: { type: DataTypes.STRING(10), allowNull: true },
        rf: { type: DataTypes.STRING(10), allowNull: true },
        rw: { type: DataTypes.STRING(10), allowNull: true },
        lam: { type: DataTypes.STRING(10), allowNull: true },
        cam: { type: DataTypes.STRING(10), allowNull: true },
        ram: { type: DataTypes.STRING(10), allowNull: true },
        lm: { type: DataTypes.STRING(10), allowNull: true },
        lcm: { type: DataTypes.STRING(10), allowNull: true },
        cm: { type: DataTypes.STRING(10), allowNull: true },
        rcm: { type: DataTypes.STRING(10), allowNull: true },
        rm: { type: DataTypes.STRING(10), allowNull: true },
        lwb: { type: DataTypes.STRING(10), allowNull: true },
        ldm: { type: DataTypes.STRING(10), allowNull: true },
        cdm: { type: DataTypes.STRING(10), allowNull: true },
        rdm: { type: DataTypes.STRING(10), allowNull: true },
        rwb: { type: DataTypes.STRING(10), allowNull: true },
        lb: { type: DataTypes.STRING(10), allowNull: true },
        lcb: { type: DataTypes.STRING(10), allowNull: true },
        cb: { type: DataTypes.STRING(10), allowNull: true },
        rcb: { type: DataTypes.STRING(10), allowNull: true },
        rb: { type: DataTypes.STRING(10), allowNull: true },
        gk: { type: DataTypes.STRING(10), allowNull: true },

        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'PlayerVersion',
        indexes: [
          { fields: ['player_id'], name: 'idx_playerversion_player' },
          { fields: ['club_id'], name: 'idx_playerversion_club' },
          { fields: ['nation_team_id'], name: 'idx_playerversion_nation_team' },
          { fields: ['fifa_version'], name: 'idx_playerversion_fifa_version' },
          { fields: ['overall'], name: 'idx_playerversion_overall' },
          { fields: ['value_eur'], name: 'idx_playerversion_value' },
          { fields: ['player_id', 'fifa_version'], name: 'idx_playerversion_timeline' },
          { fields: ['overall', 'fifa_version', 'club_id'], name: 'idx_playerversion_filters' },
        ],
      }
    );

    return PlayerVersion;
  }

  static associate(models: { 
    Player: typeof import('./Player').Player, 
    Club: typeof import('../location/Club').Club, 
    NationTeam: typeof import('../location/NationTeam').NationTeam, 
    SkillStats: typeof import('../skills/SkillStats').SkillStats,
    PlayerVersionPosition: typeof import('./PlayerVersionPosition').PlayerVersionPosition
  }) {
    this.belongsTo(models.Player, { foreignKey: 'player_id', as: 'player', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    this.belongsTo(models.Club, { foreignKey: 'club_id', as: 'club', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    this.belongsTo(models.NationTeam, { foreignKey: 'nation_team_id', as: 'nationTeam', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    this.belongsTo(models.SkillStats, { foreignKey: 'skill_set_id', as: 'skillSet', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    this.hasMany(models.PlayerVersionPosition, { foreignKey: 'player_version_id', as: 'positions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}
