const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Función para verificar si un username es válido (no vacío y cumple criterios básicos)
const isValid = (username) => { 
    // Verifica que el username:
    // - No esté vacío
    // - Tenga al menos 3 caracteres
    // - Solo contenga caracteres alfanuméricos
    if (!username || username.length < 3) {
        return false;
    }
    
    // Expresión regular para validar solo letras y números
    const validUsername = /^[a-zA-Z0-9]+$/;
    return validUsername.test(username);
}

// Función para verificar si el usuario ya existe
const doesExist = (username) => {
    // Filtra el array de usuarios para encontrar uno con el mismo username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    
    // Si el array tiene elementos, el usuario existe
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Función para autenticar usuario con username y password
const authenticatedUser = (username, password) => {
    // Filtra usuarios que coincidan con username Y password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    
    // Si encontramos exactamente un usuario, está autenticado
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// TAREA 7: Endpoint para login de usuarios registrados
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Verifica que se proporcionaron username y password
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Username and password required." });
    }

    // Autentica al usuario
    if (authenticatedUser(username, password)) {
        // Genera JWT token
        let accessToken = jwt.sign({
            data: password,
            username: username
        }, 'access', { expiresIn: 60 * 60 }); // Token válido por 1 hora

        // Guarda el token y username en la sesión
        req.session.authorization = {
            accessToken,
            username
        }

        return res.status(200).json({ 
            message: "User successfully logged in",
            token: accessToken 
        });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// TAREA 8: Agregar o modificar una reseña de libro (requiere autenticación)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // La reseña viene como query parameter
    
    // Obtiene el username de la sesión (usuario autenticado)
    const username = req.session.authorization['username'];
    
    // Verifica que se proporcionó una reseña
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Verifica que el libro existe
    if (books[isbn]) {
        // Si el libro no tiene objeto de reviews, créalo
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        
        // Verifica si el usuario ya tiene una reseña para este libro
        if (books[isbn].reviews[username]) {
            // Modifica la reseña existente
            books[isbn].reviews[username] = review;
            return res.status(200).json({ 
                message: `Review for book with ISBN ${isbn} updated successfully by user ${username}`,
                review: review
            });
        } else {
            // Agrega una nueva reseña
            books[isbn].reviews[username] = review;
            return res.status(200).json({ 
                message: `Review for book with ISBN ${isbn} added successfully by user ${username}`,
                review: review
            });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// TAREA 9: Eliminar reseña de un libro (requiere autenticación)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Obtiene el username de la sesión (usuario autenticado)
    const username = req.session.authorization['username'];
    
    // Verifica que el libro existe
    if (books[isbn]) {
        // Verifica que el libro tiene reseñas
        if (books[isbn].reviews) {
            // Verifica que el usuario tiene una reseña para este libro
            if (books[isbn].reviews[username]) {
                // Elimina solo la reseña del usuario autenticado
                delete books[isbn].reviews[username];
                return res.status(200).json({ 
                    message: `Review for ISBN ${isbn} posted by user ${username} deleted successfully`
                });
            } else {
                return res.status(404).json({ 
                    message: `No review found for ISBN ${isbn} by user ${username}`
                });
            }
        } else {
            return res.status(404).json({ 
                message: `No reviews found for book with ISBN ${isbn}`
            });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Endpoint adicional para obtener todas las reseñas del usuario autenticado
regd_users.get("/auth/reviews", (req, res) => {
    const username = req.session.authorization['username'];
    let userReviews = {};
    
    // Recorre todos los libros para encontrar las reseñas del usuario
    Object.keys(books).forEach(isbn => {
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            userReviews[isbn] = {
                title: books[isbn].title,
                review: books[isbn].reviews[username]
            };
        }
    });
    
    if (Object.keys(userReviews).length > 0) {
        return res.status(200).json({
            username: username,
            reviews: userReviews
        });
    } else {
        return res.status(404).json({ 
            message: `No reviews found for user ${username}`
        });
    }
});

// Endpoint adicional para logout
regd_users.post("/auth/logout", (req, res) => {
    // Destruye la sesión
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        return res.status(200).json({ message: "User logged out successfully" });
    });
});

// Exporta los módulos necesarios
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.doesExist = doesExist;