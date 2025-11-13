import sequelize from "../config/database";
import { Sequelize } from "sequelize";

// User
import { User } from "./user/User";

// Location
import { Nationality } from "./location/Nationality";
import { NationTeam } from "./location/NationTeam";
import { League } from "./location/League";
import { Club } from "./location/Club";

// Attributes
import { Position } from "./attributes/Position";
import { Tag } from "./attributes/Tag";
import { Trait } from "./attributes/Trait";

// Skills
import { SkillStats } from "./skills/SkillStats";

// Player
import { Player } from "./player/Player";
import { PlayerVersion } from "./player/PlayerVersion";
import { PlayerVersionPosition } from "./player/PlayerVersionPosition";
import { PlayerTag } from "./player/PlayerTag";
import { PlayerTrait } from "./player/PlayerTrait";
import { FifaPlayer } from "./player/FifaPlayer";

interface ModelRegistry {
    User: typeof User;
    Nationality: typeof Nationality;
    NationTeam: typeof NationTeam;
    League: typeof League;
    Club: typeof Club;
    Position: typeof Position;
    Tag: typeof Tag;
    Trait: typeof Trait;
    SkillStats: typeof SkillStats;
    Player: typeof Player;
    PlayerVersion: typeof PlayerVersion;
    PlayerVersionPosition: typeof PlayerVersionPosition;
    PlayerTag: typeof PlayerTag;
    PlayerTrait: typeof PlayerTrait;
    FifaPlayer: typeof FifaPlayer;
}


export const initModels = (sequelizeInstance?: Sequelize) => {
  const db = sequelizeInstance ?? sequelize;

  // Init
  User.initModel(db);
  Nationality.initModel(db);
  NationTeam.initModel(db);
  League.initModel(db);
  Club.initModel(db);

  Position.initModel(db);
  Tag.initModel(db);
  Trait.initModel(db);

  SkillStats.initModel(db);

  Player.initModel(db);
  PlayerVersion.initModel(db);
  PlayerVersionPosition.initModel(db);
  PlayerTag.initModel(db);
  PlayerTrait.initModel(db);
  FifaPlayer.initModel(db);

    const models: ModelRegistry = {
        User,
        Nationality,
        NationTeam,
        League,
        Club,
        Position,
        Tag,
        Trait,
        SkillStats,
        Player,
        PlayerVersion,
        PlayerVersionPosition,
        PlayerTag,
        PlayerTrait,
        FifaPlayer,
    };

  // Associations
  // Location
  NationTeam.associate?.(models);
  Club.associate?.(models);

  // User <-> Player
  Player.associate?.(models);

  // Player Version and related
  PlayerVersion.associate?.(models);
  PlayerVersionPosition.associate?.(models);

  // Tags/Traits
  PlayerTag.associate?.(models);
  PlayerTrait.associate?.(models);

  // FifaPlayer has no associations (standalone table)
  FifaPlayer.associate?.();

  return {
    sequelize: db,
    User,
    Nationality,
    NationTeam,
    League,
    Club,
    Position,
    Tag,
    Trait,
    SkillStats,
    Player,
    PlayerVersion,
    PlayerVersionPosition,
    PlayerTag,
    PlayerTrait,
    FifaPlayer,
  };
};

// Initialize immediately by default
initModels();