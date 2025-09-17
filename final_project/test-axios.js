// test-axios.js - Archivo para probar las funciones con Axios
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// TAREA 10: Obtener todos los libros con async/await
async function testGetAllBooks() {
    console.log(colors.blue + '\n=== TAREA 10: Fetching all books (async/await) ===' + colors.reset);
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        console.log(colors.green + '✓ Books fetched successfully!' + colors.reset);
        console.log('Total books:', Object.keys(response.data).length);
        return response.data;
    } catch (error) {
        console.error(colors.red + '✗ Error:' + colors.reset, error.message);
    }
}

// TAREA 11: Buscar libro por ISBN con Promises
function testGetBookByISBN(isbn) {
    console.log(colors.blue + `\n=== TAREA 11: Fetching book with ISBN ${isbn} (Promises) ===` + colors.reset);
    
    return axios.get(`${API_BASE_URL}/isbn/${isbn}`)
        .then(response => {
            console.log(colors.green + '✓ Book found!' + colors.reset);
            console.log('Title:', response.data.title);
            console.log('Author:', response.data.author);
            return response.data;
        })
        .catch(error => {
            console.error(colors.red + '✗ Error:' + colors.reset, error.response?.data?.message || error.message);
        });
}

// TAREA 12: Buscar libros por autor con async/await
async function testGetBooksByAuthor(author) {
    console.log(colors.blue + `\n=== TAREA 12: Fetching books by ${author} (async/await) ===` + colors.reset);
    try {
        const response = await axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`);
        console.log(colors.green + '✓ Books found!' + colors.reset);
        console.log('Number of books:', Object.keys(response.data).length);
        return response.data;
    } catch (error) {
        console.error(colors.red + '✗ Error:' + colors.reset, error.response?.data?.message || error.message);
    }
}

// TAREA 13: Buscar libros por título con Promises
function testGetBooksByTitle(title) {
    console.log(colors.blue + `\n=== TAREA 13: Fetching books with title "${title}" (Promises) ===` + colors.reset);
    
    return axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`)
        .then(response => {
            console.log(colors.green + '✓ Books found!' + colors.reset);
            console.log('Number of books:', Object.keys(response.data).length);
            return response.data;
        })
        .catch(error => {
            console.error(colors.red + '✗ Error:' + colors.reset, error.response?.data?.message || error.message);
        });
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
    console.log(colors.bright + colors.yellow);
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     TESTING ASYNC/AWAIT & PROMISES        ║');
    console.log('║           WITH AXIOS                      ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(colors.reset);

    // Asegúrate de que el servidor esté corriendo
    try {
        await axios.get(`${API_BASE_URL}/`);
    } catch (error) {
        console.error(colors.red + '✗ Server is not running! Please start the server first.' + colors.reset);
        return;
    }

    // Ejecuta las pruebas
    await testGetAllBooks();
    await testGetBookByISBN('1');
    await testGetBooksByAuthor('Chinua Achebe');
    await testGetBooksByTitle('Things');

    console.log(colors.bright + colors.green);
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║         ALL TESTS COMPLETED!              ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(colors.reset);
}

// Ejecuta las pruebas si este archivo se ejecuta directamente
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testGetAllBooks,
    testGetBookByISBN,
    testGetBooksByAuthor,
    testGetBooksByTitle
};