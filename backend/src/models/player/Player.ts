import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey, Association, NonAttribute, HasManyGetAssociationsMixin } from "sequelize";
import type { User } from "../user/User";
import type { Nationality } from "../location/Nationality";
import type { PlayerVersion } from "./PlayerVersion";

import { BaseModel } from "../BaseModel";
export class Player extends BaseModel<InferAttributes<Player>, InferCreationAttributes<Player>> {
  declare id: CreationOptional<number>;
  declare external_player_id: number;
  declare short_name: string | null;
  declare long_name: string | null;
  declare user_id: ForeignKey<number>;
  declare nationality_id: ForeignKey<number>;
  declare player_url: string | null;
  declare dob: Date | null;
  declare player_face_url: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // associations
  declare versions?: NonAttribute<PlayerVersion[]>;
  declare getVersions: HasManyGetAssociationsMixin<PlayerVersion>;

  static initModel(sequelize: Sequelize): typeof Player {
    Player.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
        external_player_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, comment: 'ID from CSV: player_id' },
        short_name: { type: DataTypes.STRING(100), allowNull: true },
        long_name: { type: DataTypes.STRING(255), allowNull: true },
        user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        nationality_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        player_url: { type: DataTypes.STRING(255), allowNull: true },
        dob: { type: DataTypes.DATEONLY, allowNull: true },
        player_face_url: { type: DataTypes.STRING(255), allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'Player',
        indexes: [
          { fields: ['external_player_id'], name: 'idx_player_external_id', unique: true },
          { fields: ['nationality_id'], name: 'idx_player_nationality' },
          { fields: ['user_id'], name: 'idx_player_user' },
          { fields: ['short_name'], name: 'idx_player_short_name' },
          { fields: ['long_name'], name: 'idx_player_long_name' },
        ],
      }
    );

    return Player;
  }

  static associate(models: { User: typeof import('../user/User').User, Nationality: typeof import('../location/Nationality').Nationality, PlayerVersion: typeof import('./PlayerVersion').PlayerVersion }) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
    this.belongsTo(models.Nationality, { foreignKey: 'nationality_id', as: 'nationality', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });

    this.hasMany(models.PlayerVersion, { foreignKey: 'player_id', as: 'versions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }

  declare static associations: {
    versions: Association<Player, PlayerVersion>;
  };
}
