# Models

This folder contains all Sequelize models for the Soccer Stats backend, structured by domain.

Structure
- index.ts: initializes all models and their associations
- user/
  - User.model.ts
- location/
  - Nationality.ts
  - NationTeam.ts
  - League.ts
  - Club.ts
- attributes/
  - Position.ts
  - Tag.ts
  - Trait.ts
- skills/
  - SkillStats.ts
- player/
  - Player.ts
  - PlayerVersion.ts
  - PlayerVersionPosition.ts
  - PlayerTag.ts
  - PlayerTrait.ts

Usage
- Models are automatically initialized when importing `src/models` anywhere in the app.
- The server entrypoint `src/index.ts` imports `./models` before calling `sequelize.sync()` to ensure models/tables exist.

Notes
- Data types, indexes and relationships are aligned with PROJECT_KNOWLEDGE.md.
- Financial columns use BIGINT; skills use TINYINT (0-100).
- Timestamps use created_at and updated_at fields where specified.
