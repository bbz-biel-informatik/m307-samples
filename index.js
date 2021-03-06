// Importieren von Code-Bibliotheken
var express = require('express');
var mustacheExpress = require('mustache-express');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer  = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const bcrypt = require('bcrypt');
const sessions = require('express-session');

var app = express();
var port = 3000;

// Konfiguration und Einstellungen
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

var pool = new Pool({
  user: 'postgres',
  host: 'bbz.cloud',
  database: 'm307demo',
  password: '...',
  port: 8080,
});

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: 86400000, secure: false },
  resave: false
}));

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
  if(!req.session.benutzername) { res.redirect('/login_form'); return; }
  pool.query('SELECT * FROM todos', (error, result) => {
    if(error) {
      throw error;
    }
    res.render('todos', { todos: result.rows, farbe: req.cookies['color'] });
  });
});

app.get('/todos/:id', (req, res) => {
  pool.query(`SELECT * FROM todos WHERE id = ${req.params.id}`, (error, result) => {
    if(error) {
      throw error;
    }
    res.render('todo', { todo: result.rows[0] });
  });
});

app.get('/todos/:id/edit', (req, res) => {
  pool.query(`SELECT * FROM todos WHERE id = ${req.params.id}`, (error, result) => {
    if(error) {
      throw error;
    }
    res.render('edit_todo', { todo: result.rows[0] });
  });
});


app.post('/update/:id', (req, res) => {
  pool.query(`UPDATE todos SET name = '${req.body.name}' WHERE id = ${req.params.id}`, (error, result) => {
    if(error) { throw error; }
    res.redirect('/todos');
  });
});

app.post('/delete/:id', (req, res) => {
  pool.query(`DELETE FROM todos WHERE id = ${req.params.id}`, (error, result) => {
    if(error) { throw error; }
    res.redirect('/todos');
  });
});

app.get('/form', function(req, res) {
  res.render('form');
});

app.post('/dateiupload', upload.single('image'), function (req, res, next) {
  pool.query(`INSERT INTO uploads (beschreibung, dateiname) VALUES ('${req.body.beschreibung}', '${req.file.filename}')`, (error, result) => {
    if(error) { throw error; }
    res.redirect('/todos');
  });
});

app.get('/registration_form', function(req, res) {
  res.render('registration_form');
});

app.post('/register', function (req, res) {
  var passwort = bcrypt.hashSync(req.body.passwort, 10);
  pool.query(`INSERT INTO users (benutzername, passwort) VALUES ('${req.body.benutzername}', '${passwort}')`, (error, result) => {
    if(error) { throw error; }
    res.redirect('/login_form');
  });
});

app.get('/login_form', function(req, res) {
  res.render('login_form');
});

app.post('/login', function (req, res) {
  pool.query(`SELECT * FROM users WHERE benutzername = '${req.body.benutzername}'`, (error, result) => {
    if(error) { throw error; }
    if(bcrypt.compareSync(req.body.passwort, result.rows[0].passwort)) {
      req.session.benutzername = result.rows[0].benutzername;
      res.redirect('/todos');
    } else {
      res.redirect('/login_form');
    }
  });
});

// Serverstart
app.listen(port, () => {
  console.log('App listening on port ' + port);
});
