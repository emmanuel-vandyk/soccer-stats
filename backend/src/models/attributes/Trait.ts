import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import { BaseModel } from "../BaseModel";
export class Trait extends BaseModel<InferAttributes<Trait>, InferCreationAttributes<Trait>> {
  declare id: CreationOptional<number>;
  declare name: string;

  static initModel(sequelize: Sequelize): typeof Trait {
    Trait.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          comment: 'e.g., "Finesse Shot", "Speed Dribbler (AI)"'
        },
      },
      {
        sequelize,
        tableName: 'Trait',
        indexes: [
          { fields: ['name'], name: 'idx_trait_name', unique: true },
        ],
      }
    );

    return Trait;
  }
}
