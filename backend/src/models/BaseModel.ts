import { Model } from 'sequelize';


export class BaseModel<
    TModelAttributes extends {},
    TCreationAttributes extends {}
> extends Model<TModelAttributes, TCreationAttributes> {
    // Preserve Model's methods typings to avoid TS override issues
}