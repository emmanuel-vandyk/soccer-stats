import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import { BaseModel } from "../BaseModel";
export class Position extends BaseModel<InferAttributes<Position>, InferCreationAttributes<Position>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare position_type: string | null;

  static initModel(sequelize: Sequelize): typeof Position {
    Position.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        code: {
          type: DataTypes.STRING(10),
          allowNull: false,
          unique: true,
          comment: 'ST, CAM, CB, GK, etc.'
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        position_type: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'Position',
        indexes: [
          { fields: ['code'], name: 'idx_position_code', unique: true },
          { fields: ['position_type'], name: 'idx_position_type' },
        ],
      }
    );

    return Position;
  }
}
