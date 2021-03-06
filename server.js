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
        <link href="/ui/bootstrap.min.css"  rel="stylesheet">
    </head>
    
      <body class = "infobody">
      
      
      
           
          <div class="container"> 
                      
        <section class="navbar navbar-fixed-top custom-navbar" role="navigation">
	<div class="container">
		<div class="navbar-header">
			<a href="/" class="navbar-brand">BLOG</a></div>
		<div class="collapse navbar-collapse">
			<ul class="nav navbar-nav navbar-right">
				<li><a href="/" class="smoothScroll">HOME</a></li>
				<li><a href="/info" class="smoothScroll">INFO</a></li>
				<li><a href="/logout" class="smoothScroll">LOGOUT</a></li>
			</ul>
		</div>
	</div>
</section>

        <br>
         <br>
           
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
           
         <div>

                ${content}

              </div>

              <hr/>

              <h4>Comments</h4>

              <div id="comment_form">

              </div>

              <div id="comments">

                <center>Loading comments...</center>

              </div>

          </div>
          <script type="text/javascript" src="/ui/article.js"></script>   
           
      </body>
    
    
    
    
    
</html>`;
return htmlTemplate;
}




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
     pool.query('INSERT INTO "user" (username,password) values($1,$2)',[username,dbstring],function(err,result){
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
                    
               }else{
                 res.status(403).send('Username/Password Invalid');  
               }
           }
       }
});

});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
                 res.send(result.rows[0].username);    
           }
       });
    }else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout',function (req,res){
   delete req.session.auth;
   res.send('<html><body></br><div align="center"><h3>Logged out!</h3><br/><br/><a href="/">Back to home</a> </div></body></html>');
    
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {

   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});



app.get('/get-comments/:articleName', function (req, res) {

  pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id="user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });

});



app.post('/submit-comment/:articleName', function (req, res) {

    if (req.session && req.session.auth && req.session.auth.userId) {
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
pool.query("INSERT INTO comment (article_id, user_id, comment) VALUES ($1, $2, $3)", [articleId, req.session.auth.userId,req.body.comment], function (err, result) {
                            if (err) {
                               res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});



app.get('/info', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.html'));
});






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

app.get('/', function (req, res) {

  res.sendFile(path.join(__dirname, 'ui', 'index.html'));

});

app.get('/ui/main.js', function (req, res) { 
 res.sendFile(path.join(__dirname, 'ui', 'main.js'));  
}); 
 
app.get('/ui/style.css', function (req, res) { 
 res.sendFile(path.join(__dirname, 'ui', 'style.css')); 
});
 
app.get('/ui/bootstrap.min.css', function (req, res) { 
 res.sendFile(path.join(__dirname, 'ui', 'bootstrap.min.css')); 
}); 

app.get('/ui/info.js', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'info.js')); 
}); 

app.get('/ui/article.js', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'article.js')); 
}); 

app.get('/ui/smoothscroll.js', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'smoothscroll.js')); 
}); 

app.get('/ui/logo.png', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'logo.png')); 
}); 

app.get('/ui/main.jpg', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'main.jpg')); 
 });

app.get('/ui/sub.jpg', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'sub.jpg')); 
 });

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
