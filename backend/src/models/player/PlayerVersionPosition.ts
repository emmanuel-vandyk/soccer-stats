import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey } from "sequelize";

import { BaseModel } from "../BaseModel";
export class PlayerVersionPosition extends BaseModel<InferAttributes<PlayerVersionPosition>, InferCreationAttributes<PlayerVersionPosition>> {
  declare id: CreationOptional<number>;
  declare player_version_id: ForeignKey<number>;
  declare position_id: ForeignKey<number>;
  declare is_primary: CreationOptional<boolean>;

  static initModel(sequelize: Sequelize): typeof PlayerVersionPosition {
    PlayerVersionPosition.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
        player_version_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        position_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      {
        sequelize,
        tableName: 'PlayerVersionPosition',
        indexes: [
          { fields: ['player_version_id', 'position_id'], unique: true, name: 'unique_playerversion_position' },
          { fields: ['player_version_id'], name: 'idx_pvp_player_version' },
          { fields: ['position_id'], name: 'idx_pvp_position' },
        ],
      }
    );

    return PlayerVersionPosition;
  }

  static associate(models: { PlayerVersion: typeof import('./PlayerVersion').PlayerVersion, Position: typeof import('../attributes/Position').Position }) {
    this.belongsTo(models.PlayerVersion, { foreignKey: 'player_version_id', as: 'playerVersion', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    this.belongsTo(models.Position, { foreignKey: 'position_id', as: 'position', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}
