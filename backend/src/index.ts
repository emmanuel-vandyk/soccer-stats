import app from "./app";
import sequelize from "./config/database";
import { config } from "./config";
import "./models";

const { port, env, startWithoutDb } = config.server as typeof config.server & { startWithoutDb: boolean };

async function startServer() {
    let dbConnected = false;
    try {
        await sequelize.authenticate();
        dbConnected = true;
        console.log('Connection successfully established to MySQL ');
    } catch (error) {
        console.error("Failed to connect to database:");
        console.error(error);
        if (!startWithoutDb) {
            process.exit(1);
            return;
        }
        console.warn("Continuing to start the server without a database connection (START_WITHOUT_DB=true)");
    }

    try {
        if (dbConnected && env === "development") {
            // Sync only specific models (exclude FifaPlayer which uses existing table)
            const modelsToSync = Object.values(sequelize.models).filter(
                model => model.tableName !== 'players'
            );
            
            for (const model of modelsToSync) {
                await model.sync({ alter: false });
            }
            console.log('Sync models successfully!')
        }

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            console.log(`Environment: ${config.server.env}`);
            if (!dbConnected) {
                console.warn("Server started without database connection. Some endpoints may not work.");
            }
        });
    } catch (error) {
        console.error("Failed to start server:");
        console.error(error);
        process.exit(1);
    }
}

const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received, closing server gracefully`);
    try {
        await sequelize.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

void startServer();