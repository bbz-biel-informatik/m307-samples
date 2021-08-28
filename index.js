// Importieren von Code-Bibliotheken
var express = require('express');
var mustacheExpress = require('mustache-express');
var Pool = require('pg').Pool;

var app = express();
var port = 3000;

// Konfiguration und Einstellungen
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'm307',
  password: 'postgres',
  port: 5432,
});

// Routen
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/todos', (req, res) => {
  pool.query('SELECT * FROM todos', (error, result) => {
    if(error) {
      throw error;
    }
    res.render('todos', { todos: result.rows });
  });
});

// Serverstart
app.listen(port, () => {
  console.log('App listening on port ' + port);
});
