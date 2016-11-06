var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');

var config = {
    user:'aravindvijay7',
    database:'aravindvijay7',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASSWORD
    
};

var app = express();
app.use(morgan('combined'));

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
    return hashed.toString('hex');
    
}

app.get('/hash/:input',function(req,res){
   var hashString = hash(req.params.input,'this-is-a-ramdom-string');
   res.send(hashedString);
    
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
        <meta name="viewport" content="width=device-width , initial-scale-1"/> 
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
