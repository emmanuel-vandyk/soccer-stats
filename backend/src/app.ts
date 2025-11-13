import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { config } from "./config";

const app: Application = express();
const { origin } = config.cors
const { env } = config.server

// Compression middleware - Compress all responses
app.use(compression());

// Configure Helmet with CSP to allow SoFIFA images
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:",
                "https://cdn.sofifa.net",
                "https://cdn.sofifa.com",
                "https://*.sofifa.net",
                "https://*.sofifa.com",
            ]
        }
    }
}));

app.use(cors({
    origin: origin,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import routes from './routes';

// Mount routes
app.use('/api', routes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: "Server OK", timestamp: new Date().toISOString()});
});

// Express error handler must have 4 parameters
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err?.status || 500).json({
        error: err?.message || "Server internal error",
        ...(env === "development" && { stack: err?.stack })
    });
});

export default app;