const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Función auxiliar para verificar si el usuario existe
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// TAREA 6: Registrar nuevo usuario
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Verifica que se proporcionaron username y password
    if (!username || !password) {
        return res.status(404).json({ 
            message: "Unable to register user. Username and password required." 
        });
    }

    // Verifica que el username sea válido (usando la función de auth_users.js)
    if (!isValid(username)) {
        return res.status(400).json({ 
            message: "Invalid username. Must be at least 3 characters and contain only letters and numbers." 
        });
    }

    // Verifica que el password tenga al menos 4 caracteres
    if (password.length < 4) {
        return res.status(400).json({ 
            message: "Password must be at least 4 characters long." 
        });
    }

    // Verifica si el usuario ya existe
    if (doesExist(username)) {
        return res.status(409).json({ 
            message: "User already exists!" 
        });
    } else {
        // Agrega el nuevo usuario al array
        users.push({
            "username": username,
            "password": password
        });
        
        return res.status(200).json({ 
            message: "User successfully registered. Now you can login" 
        });
    }
});

// TAREA 1: Obtener la lista de todos los libros disponibles
public_users.get('/', function (req, res) {
    // Envía el objeto books formateado como JSON
    res.status(200).send(JSON.stringify(books, null, 4));
});

// TAREA 2: Obtener detalles del libro basado en ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Verifica si el libro existe con ese ISBN
    if (books[isbn]) {
        res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } else {
        res.status(404).json({ 
            message: `Book with ISBN ${isbn} not found` 
        });
    }
});

// TAREA 3: Obtener detalles del libro basado en el autor
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let filtered_books = {};
    
    // Itera a través de todos los libros
    Object.keys(books).forEach(isbn => {
        // Compara el autor (case insensitive)
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            filtered_books[isbn] = books[isbn];
        }
    });
    
    // Verifica si se encontraron libros
    if (Object.keys(filtered_books).length > 0) {
        res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
        res.status(404).json({ 
            message: `No books found by author: ${author}` 
        });
    }
});

// TAREA 4: Obtener todos los libros basados en el título
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let filtered_books = {};
    
    // Itera a través de todos los libros
    Object.keys(books).forEach(isbn => {
        // Compara el título (case insensitive y búsqueda parcial)
        if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
            filtered_books[isbn] = books[isbn];
        }
    });
    
    // Verifica si se encontraron libros
    if (Object.keys(filtered_books).length > 0) {
        res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
        res.status(404).json({ 
            message: `No books found with title containing: ${title}` 
        });
    }
});

// TAREA 5: Obtener reseñas de un libro
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Verifica si el libro existe
    if (books[isbn]) {
        // Verifica si el libro tiene reseñas
        if (books[isbn].reviews && Object.keys(books[isbn].reviews).length > 0) {
            res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
        } else {
            res.status(200).json({ 
                message: `No reviews yet for book with ISBN ${isbn}`,
                reviews: {} 
            });
        }
    } else {
        res.status(404).json({ 
            message: `Book with ISBN ${isbn} not found` 
        });
    }
});

// ====================================================================
// TAREAS 10-13: IMPLEMENTACIÓN CON ASYNC/AWAIT Y PROMISES
// ====================================================================

// TAREA 10: Obtener todos los libros usando Async-Await
public_users.get('/async/books', async function(req, res) {
    try {
        // Simula una llamada asíncrona
        const getAllBooks = async () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(books);
                }, 1000); // Simula delay de red
            });
        };
        
        const allBooks = await getAllBooks();
        res.status(200).json({
            message: "Books fetched using async/await",
            data: allBooks
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching books",
            error: error.message 
        });
    }
});

// Función auxiliar para hacer llamadas con Axios (para demostración)
const API_BASE_URL = 'http://localhost:5000';

// TAREA 10 (Alternativa con Axios): Obtener todos los libros
async function getAllBooksAxios() {
    try {
        console.log("Fetching all books using async/await with Axios...");
        const response = await axios.get(`${API_BASE_URL}/`);
        console.log("Books fetched successfully!");
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error.message);
        throw error;
    }
}

// TAREA 11: Buscar libro por ISBN usando Promises
public_users.get('/promise/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    
    // Implementación con Promises
    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject(new Error(`Book with ISBN ${isbn} not found`));
                }
            }, 1000); // Simula delay de red
        });
    };
    
    getBookByISBN(isbn)
        .then(book => {
            res.status(200).json({
                message: "Book fetched using Promises",
                data: book
            });
        })
        .catch(error => {
            res.status(404).json({ 
                message: error.message 
            });
        });
});

// TAREA 11 (Alternativa con Axios): Buscar por ISBN con Promises
function getBookByISBNAxios(isbn) {
    console.log(`Fetching book with ISBN ${isbn} using Promises...`);
    return axios.get(`${API_BASE_URL}/isbn/${isbn}`)
        .then(response => {
            console.log("Book found!");
            return response.data;
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
            throw error;
        });
}

// TAREA 12: Buscar libros por autor usando Async-Await
public_users.get('/async/author/:author', async function(req, res) {
    const author = req.params.author;
    
    try {
        // Implementación con async/await
        const getBooksByAuthor = async (author) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let authorBooks = {};
                    Object.keys(books).forEach(isbn => {
                        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                            authorBooks[isbn] = books[isbn];
                        }
                    });
                    resolve(authorBooks);
                }, 1000); // Simula delay de red
            });
        };
        
        const authorBooks = await getBooksByAuthor(author);
        
        if (Object.keys(authorBooks).length > 0) {
            res.status(200).json({
                message: "Books fetched by author using async/await",
                data: authorBooks
            });
        } else {
            res.status(404).json({ 
                message: `No books found by author: ${author}` 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching books by author",
            error: error.message 
        });
    }
});

// TAREA 12 (Alternativa con Axios): Buscar por autor con Async-Await
async function getBooksByAuthorAxios(author) {
    try {
        console.log(`Fetching books by author ${author} using async/await...`);
        const response = await axios.get(`${API_BASE_URL}/author/${author}`);
        console.log("Books found!");
        return response.data;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

// TAREA 13: Buscar libros por título usando Promises
public_users.get('/promise/title/:title', function(req, res) {
    const title = req.params.title;
    
    // Implementación con Promises
    const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let titleBooks = {};
                Object.keys(books).forEach(isbn => {
                    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                        titleBooks[isbn] = books[isbn];
                    }
                });
                
                if (Object.keys(titleBooks).length > 0) {
                    resolve(titleBooks);
                } else {
                    reject(new Error(`No books found with title containing: ${title}`));
                }
            }, 1000); // Simula delay de red
        });
    };
    
    getBooksByTitle(title)
        .then(books => {
            res.status(200).json({
                message: "Books fetched by title using Promises",
                data: books
            });
        })
        .catch(error => {
            res.status(404).json({ 
                message: error.message 
            });
        });
});

// TAREA 13 (Alternativa con Axios): Buscar por título con Promises
function getBooksByTitleAxios(title) {
    console.log(`Fetching books with title "${title}" using Promises...`);
    return axios.get(`${API_BASE_URL}/title/${title}`)
        .then(response => {
            console.log("Books found!");
            return response.data;
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
            throw error;
        });
}

// ====================================================================
// ENDPOINTS ADICIONALES ÚTILES
// ====================================================================

// Obtener estadísticas de libros
public_users.get('/stats', function(req, res) {
    const stats = {
        totalBooks: Object.keys(books).length,
        authors: [...new Set(Object.values(books).map(book => book.author))],
        booksWithReviews: Object.values(books).filter(book => 
            book.reviews && Object.keys(book.reviews).length > 0
        ).length
    };
    
    res.status(200).json(stats);
});

// Buscar libros con filtros múltiples
public_users.get('/search', function(req, res) {
    const { author, title, hasReviews } = req.query;
    let filtered_books = { ...books };
    
    // Filtrar por autor si se proporciona
    if (author) {
        Object.keys(filtered_books).forEach(isbn => {
            if (!filtered_books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
                delete filtered_books[isbn];
            }
        });
    }
    
    // Filtrar por título si se proporciona
    if (title) {
        Object.keys(filtered_books).forEach(isbn => {
            if (!filtered_books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                delete filtered_books[isbn];
            }
        });
    }
    
    // Filtrar por presencia de reseñas si se especifica
    if (hasReviews === 'true') {
        Object.keys(filtered_books).forEach(isbn => {
            if (!filtered_books[isbn].reviews || Object.keys(filtered_books[isbn].reviews).length === 0) {
                delete filtered_books[isbn];
            }
        });
    }
    
    res.status(200).send(JSON.stringify(filtered_books, null, 4));
});

// ====================================================================
// FUNCIONES DE PRUEBA PARA AXIOS (Para ejecutar desde otro archivo)
// ====================================================================

// Exporta las funciones de Axios para pruebas
module.exports.axiosTests = {
    getAllBooks: getAllBooksAxios,
    getBookByISBN: getBookByISBNAxios,
    getBooksByAuthor: getBooksByAuthorAxios,
    getBooksByTitle: getBooksByTitleAxios
};

module.exports.general = public_users;