var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
    host     : 'exam.ckstkb31hkt6.us-east-2.rds.amazonaws.com',
    user     : 'admin',
    password : "",
    database : 'exam'
});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});

var app = express();
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get('/', function(request, response) {
    if (request.session.logged_in) {
        response.render('result', {data: request.session.data});
    } else {
        response.render('index', {province: "", grade: "", code: "", message: ""});
    }
});

app.post('/', function(request, response) {
    console.log(request.body);
    var province = request.body.province;
    var grade = request.body.grade;
    var code = request.body.code;

    if (province && grade && code) {
        connection.query('SELECT * FROM results2019 WHERE province = ? AND grade = ? AND id = ?', [province, grade, code], function(error, results, fields) {
            if (results.length > 0) {
                request.session.data = results[0];
                request.session.logged_in = true;
                response.redirect('/');
            } else {
                response.render('index', {
                    province: province,
                    grade: grade,
                    code: code,
                    message: "Таны оруулсан мэдээлэл алдаатай байна. Дахин шалгана уу.",
                });
            }
            response.end();
        });
        connection.end();
    }
});

app.get('/logout', function(request, response) {
    request.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        response.redirect('/');
    });
});

app.listen(3000);