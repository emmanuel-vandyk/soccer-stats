import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey } from "sequelize";

import { BaseModel } from "../BaseModel";
export class PlayerTag extends BaseModel<InferAttributes<PlayerTag>, InferCreationAttributes<PlayerTag>> {
  declare id: CreationOptional<number>;
  declare player_id: ForeignKey<number>;
  declare tag_id: ForeignKey<number>;

  static initModel(sequelize: Sequelize): typeof PlayerTag {
    PlayerTag.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
        player_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        tag_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      },
      {
        sequelize,
        tableName: 'PlayerTag',
        indexes: [
          { fields: ['player_id', 'tag_id'], unique: true, name: 'unique_player_tag' },
          { fields: ['player_id'], name: 'idx_playertag_player' },
          { fields: ['tag_id'], name: 'idx_playertag_tag' },
        ],
      }
    );

    return PlayerTag;
  }

  static associate(models: { Player: typeof import('./Player').Player, Tag: typeof import('../attributes/Tag').Tag }) {
    this.belongsTo(models.Player, { foreignKey: 'player_id', as: 'player', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    this.belongsTo(models.Tag, { foreignKey: 'tag_id', as: 'tag', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}
