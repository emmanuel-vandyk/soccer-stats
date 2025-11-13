import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey } from "sequelize";
import type { Nationality } from "./Nationality";

import { BaseModel } from "../BaseModel";
export class NationTeam extends BaseModel<InferAttributes<NationTeam>, InferCreationAttributes<NationTeam>> {
  declare id: CreationOptional<number>;
  declare external_team_id: number;
  declare nationality_id: ForeignKey<number>;
  declare name: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize): typeof NationTeam {
    NationTeam.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        external_team_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          comment: 'ID from CSV: nation_team_id'
        },
        nationality_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "NationTeam",
        indexes: [
          { fields: ["external_team_id"], name: "idx_nationteam_external_id" },
          { fields: ["nationality_id"], name: "idx_nationteam_nationality" },
        ],
      }
    );

    return NationTeam;
  }

  static associate(models: { Nationality: typeof import('./Nationality').Nationality }) {
    this.belongsTo(models.Nationality, { foreignKey: 'nationality_id', as: 'nationality', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}
