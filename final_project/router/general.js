const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de sesión para rutas de cliente
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000 // 1 hora
    }
}));

// AUTENTICACIÓN: Middleware para rutas protegidas
app.use("/customer/auth/*", function auth(req, res, next) {
    // Verifica si existe autorización en la sesión
    if (req.session.authorization) {
        // Extrae el token de la sesión
        let token = req.session.authorization['accessToken'];
        
        // Verifica el JWT
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // Token válido, agrega la información del usuario a la request
                req.user = user;
                next(); // Continúa al siguiente middleware
            } else {
                // Token inválido o expirado
                return res.status(403).json({ 
                    message: "User not authenticated. Token invalid or expired." 
                });
            }
        });
    } else {
        // No hay sesión activa
        return res.status(403).json({ 
            message: "User not logged in. Please login first." 
        });
    }
});

// Puerto del servidor
const PORT = 5000;

// Rutas
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Book Reviews API",
        endpoints: {
            public: {
                "GET /": "Get all books",
                "GET /isbn/:isbn": "Get book by ISBN",
                "GET /author/:author": "Get books by author",
                "GET /title/:title": "Get books by title",
                "GET /review/:isbn": "Get book reviews",
                "POST /register": "Register new user"
            },
            authenticated: {
                "POST /customer/login": "User login",
                "PUT /customer/auth/review/:isbn": "Add/Update review",
                "DELETE /customer/auth/review/:isbn": "Delete review"
            },
            async: {
                "GET /async/books": "Get all books (async)",
                "GET /promise/isbn/:isbn": "Get book by ISBN (promise)",
                "GET /async/author/:author": "Get books by author (async)",
                "GET /promise/title/:title": "Get books by title (promise)"
            }
        }
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path 
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║     Book Reviews API Server Running        ║
    ║                                            ║
    ║     Server is running on port ${PORT}      ║
    ║     http://localhost:${PORT}               ║
    ║                                            ║
    ║     Press CTRL+C to stop the server        ║
    ╔════════════════════════════════════════════╗
    `);
});