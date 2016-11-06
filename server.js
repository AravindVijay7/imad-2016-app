var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user:'aravindvijay7',
    database:'aravindvijay7',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASSWORD
    
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
   secret:'someRandomValue',
   cookie:{maxAge: 1000*60*24*30}
}));



app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var counter=0;
app.get('/counter',function(req, res){
   counter = counter + 1;
   res.send(counter.toString());
});

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'ui','index.html'));
});

function hash(input,salt){
    var hashed = crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
    
}

app.get('/hash/:input',function(req,res){
   var hashedString = hash(req.params.input,'this-is-a-ramdom-string');
   res.send(hashedString);
    
});

app.post('/create-user',function(req,res){
    
    var username = req.body.username;
    var password =req.body.password;
    
     var salt = crypto.randomBytes(128).toString('hex');
     var dbstring = hash(password,salt);
     pool.query('INSERT INTO "user" (username,password) values($1,$2)',[username,dbString],function(err,result){
       if(err){
           res.status(500).send(err.toString());
       } else{
           res.send("USERNAME CREATED SUCCESSFULLY :" + username);
       }
     });
});

app.post('/login',function(req,res){
    
    var username = req.body.username;
    var password = req.body.password;
    
     pool.query('SELECT * FROM "user" WHERE username =$1',[username],function(err,result){
       if(err){
           res.status(500).send(err.toString());
       } else{
           if(result.rows.length === 0){
               res.status(403).send('Username/Password Invalid');
           } else {
               var dbString = result.rows[0].password;
               var salt = dbString.split('$')[2];
               var hashedPassword = hash(password,salt);
               if(hashedPassword == dbString){
                   req.session.auth={userId: result.rows[0].id};
                   res.send('LOGIN SUCCESSFUL');
                   document.location  = "/info";
               }else{
                 res.status(403).send('Username/Password Invalid');  
               }
           }
       }
});

});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
    
    res.send('you are logged in :'+req.session.auth.userId.toString());
    
    }else{
        res.send("Not Logged in");
    }
    
});

app.get('/logout',function (req,res){
   delete req.session.auth;
   res.send('logged out');
    
});


app.get('/info', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.html'));
});

var names = [];
app.get('/submit-name',function(req,res){
   var name = req.query.name;
   names.push(name);
   res.send(JSON.stringify(names));
});


var articles = {
            'article-one': {
  title:'Article-one',
  heading:'Article One',
  date:'SEP 17,2016',
  content:` <p class="para">
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
               </p>
               
               <p>
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
                   This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.This is the first article.
               </p>`
 },
            'article-two': {
        title:'Article-Two',
        heading:'Article Two',
        date:'OCT 20,2016',
        content:` <p class="para">
                       This is the second article.
                   </p>`
         
        },
            'article-three':{
                 
                 title:'Article-Three',
                    heading:'Article Three',
                    date:'OCT 20,2016',
                    content:` <p class="para">
                                   This is the Third article.
                               </p>`
 }
};

function createTemplate(data){
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
var htmlTemplate = `<html>
    
    <head>
        
        <title> ${title} </title>
        <meta name="viewport" content="width=device-width , initial-scale=1"/> 
        <link href="/ui/style.css" rel="stylesheet" />
    </head>
    
      <body>
           
          <div class="container"> 
           <div>
               <a class="btn btn-red" href ="/">HOME</a>
           </div>
           
           <hr/>
           
           <div align="center">
               <h2>${heading} </h2>
           </div>
           
           <div>
               <h3>${date.toDateString()}</h3>
           </div>
           
           <div>
             ${content}
           </div>
           
        </div>
           
           
      </body>
    
    
    
    
    
</html>`;
return htmlTemplate;
}

var pool= new Pool(config);

app.get('/articles/:articleName', function (req, res) {
    //var articleName = req.params.articleName;
    pool.query("SELECT * FROM article WHERE title = $1",[req.params.articleName],function(err, result){
       if(err){
           res.status(500).send(err.toString());
       } else{
           if(result.rows.length === 0){
               res.status(404).send('Article not found');
           } else {
               var articleData = result.rows[0];
               res.send(createTemplate(articleData));
           }
           
       }
    });
  
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
