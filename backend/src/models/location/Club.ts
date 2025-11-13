import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, ForeignKey } from "sequelize";

import { BaseModel } from "../BaseModel";
export class Club extends BaseModel<InferAttributes<Club>, InferCreationAttributes<Club>> {
  declare id: CreationOptional<number>;
  declare external_club_id: number;
  declare league_id: ForeignKey<number> | null;
  declare name: string;
  declare club_logo_url: string | null;

  static initModel(sequelize: Sequelize): typeof Club {
    Club.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        external_club_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          comment: 'ID from CSV: club_team_id',
        },
        league_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        club_logo_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'Club',
        indexes: [
          { fields: ['external_club_id'], name: 'idx_club_external_id' },
          { fields: ['league_id'], name: 'idx_club_league' },
          { fields: ['name'], name: 'idx_club_name' },
        ],
      }
    );

    return Club;
  }

  static associate(models: { League: typeof import('./League').League }) {
    this.belongsTo(models.League, { foreignKey: 'league_id', as: 'league', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  }
}
