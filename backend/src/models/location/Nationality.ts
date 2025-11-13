import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import { BaseModel } from "../BaseModel";
export class Nationality extends BaseModel<InferAttributes<Nationality>, InferCreationAttributes<Nationality>> {
  declare id: CreationOptional<number>;
  declare external_nationality_id: number;
  declare name: string;

  static initModel(sequelize: Sequelize): typeof Nationality {
    Nationality.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        external_nationality_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          comment: 'ID from CSV: nationality_id'
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "Nationality",
        indexes: [
          { fields: ["external_nationality_id"], name: "idx_nationality_external_id" },
        ],
      }
    );

    return Nationality;
  }
}
