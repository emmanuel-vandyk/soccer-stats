export const config = {
    server: {
        port: parseInt(process.env.PORT || "3000", 10),
        env: process.env.NODE_ENV || "development",
        startWithoutDb: process.env.START_WITHOUT_DB
            ? process.env.START_WITHOUT_DB.toLowerCase() === "true"
            : (process.env.NODE_ENV || "development") === "development",
    },
    database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306", 10),
        user: process.env.DB_USER || "root",
        name: process.env.DB_NAME || "soccers_stats_db",
        password: process.env.DB_PASSWORD || "",
    },
    jwt: {
        secret: process.env.JWT_SECRET || "secret",
        expiresIn: process.env.JWT_EXPIRES || "24h",
    },
    cors: {
        origin: process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ["http://localhost:4200", "http://localhost:4000"],
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD || "",
    }
}