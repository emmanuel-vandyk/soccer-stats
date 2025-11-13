import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import { BaseModel } from "../BaseModel";
export class League extends BaseModel<InferAttributes<League>, InferCreationAttributes<League>> {
  declare id: CreationOptional<number>;
  declare external_league_id: number;
  declare name: string;
  declare level: number | null;

  static initModel(sequelize: Sequelize): typeof League {
    League.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        external_league_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          comment: 'ID from CSV: league_id',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        level: {
          type: DataTypes.TINYINT,
          allowNull: true,
          comment: '1 = top division',
        },
      },
      {
        sequelize,
        tableName: 'League',
        indexes: [
          { fields: ['external_league_id'], name: 'idx_league_external_id' },
        ],
      }
    );

    return League;
  }
}
