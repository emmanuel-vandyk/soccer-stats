import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import { BaseModel } from "../BaseModel";
export class Tag extends BaseModel<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<number>;
  declare name: string;

  static initModel(sequelize: Sequelize): typeof Tag {
    Tag.init(
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
          comment: 'e.g., "#Speedster", "#Dribbler"'
        },
      },
      {
        sequelize,
        tableName: 'Tag',
        indexes: [
          { fields: ['name'], name: 'idx_tag_name', unique: true },
        ],
      }
    );

    return Tag;
  }
}
