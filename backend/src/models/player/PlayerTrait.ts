import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey } from "sequelize";

import { BaseModel } from "../BaseModel";
export class PlayerTrait extends BaseModel<InferAttributes<PlayerTrait>, InferCreationAttributes<PlayerTrait>> {
  declare id: CreationOptional<number>;
  declare player_id: ForeignKey<number>;
  declare trait_id: ForeignKey<number>;

  static initModel(sequelize: Sequelize): typeof PlayerTrait {
    PlayerTrait.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
        player_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        trait_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      },
      {
        sequelize,
        tableName: 'PlayerTrait',
        indexes: [
          { fields: ['player_id', 'trait_id'], unique: true, name: 'unique_player_trait' },
          { fields: ['player_id'], name: 'idx_playertrait_player' },
          { fields: ['trait_id'], name: 'idx_playertrait_trait' },
        ],
      }
    );

    return PlayerTrait;
  }

  static associate(models: { Player: typeof import('./Player').Player, Trait: typeof import('../attributes/Trait').Trait }) {
    this.belongsTo(models.Player, { foreignKey: 'player_id', as: 'player', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    this.belongsTo(models.Trait, { foreignKey: 'trait_id', as: 'trait', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}
