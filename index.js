const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ xPoweredBy: false }));
app.use(express.static("public"));

// Root page (simple landing + CTA)
app.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>CRUD API</title>
            <style>
                body {margin:0;font-family:Arial, sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,#1fa2ff,#12d8fa,#a6ffcb);color:#fff;}
                .box {text-align:center;padding:32px 40px;background:rgba(0,0,0,.45);border-radius:16px;backdrop-filter:blur(4px);}
                h1 {margin:0 0 12px;font-size:44px;letter-spacing:1px;}
                p {margin:0 0 20px;font-size:16px;opacity:.9;}
                a.btn {display:inline-block;padding:12px 24px;border-radius:6px;background:#007bff;color:#fff;text-decoration:none;font-weight:600;transition:.25s;}
                a.btn:hover {background:#0056b3;}
                .links {margin-top:18px;font-size:13px;opacity:.75;}
            </style>
        </head>
        <body>
            <div class="box">
                <h1>CRUD API</h1>
                <p>Express server is running. Explore versioned routes under /api/v1.</p>
                <a href="/health" class="btn">Health Check</a>
                <div class="links">Environment: ${process.env.NODE_ENV || 'development'}</div>
            </div>
        </body>
    </html>`);
});

// Simple health endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ code: 404, status: "error", message: "Route not found" });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[ERROR] ${status} - ${err.message}`);
    res.status(status).json({ code: status, status: "error", message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
