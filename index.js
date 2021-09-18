// Importieren von Code-Bibliotheken
var express = require('express');
var mustacheExpress = require('mustache-express');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

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

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Routen
app.get('/', (req, res) => {
  res.render('todos', { farbe: req.cookies['color'] });
});

app.post('/setcolor', (req, res) => {
  res.cookie('color', req.body.farbe);
  res.redirect('/todos');
});

app.get('/new', (req, res) => {
  res.render('new_todo');
});

app.post('/create', (req, res) => {
  pool.query(`INSERT INTO todos (name) VALUES ('${req.body.name}')`, (error, result) => {
    if(error) { throw error; }
    res.redirect('/todos');
  });
});

app.get('/todos', (req, res) => {
  pool.query('SELECT * FROM todos', (error, result) => {
    if(error) {
      throw error;
    }
    res.render('todos', { todos: result.rows, farbe: req.cookies['color'] });
  });
});

// Serverstart
app.listen(port, () => {
  console.log('App listening on port ' + port);
});
