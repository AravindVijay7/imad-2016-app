



var submit = document.getElementById('submit_btn');
submit.onclick= function(){

     var request = new XMLHttpRequest(); 
  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE){
         if(request.status === 200){
             
             console.log('user loged in');
             alert("Login Successfully");
             window.location.href ='/info';
         }else {
             if(request.status==403){
                 alert("Invalid password/Username");
             }else {
             if(request.status==500){
                 alert("Internal Server Error");
             }
          }
         }
     }
     
 };
 
 var username = document.getElementById('username').value;
 var password = document.getElementById('password').value;
 console.log(username);
 console.log(password);
 request.open('POST','http://aravindvijay7.imad.hasura-app.io/login', true);
 request.setRequestHeader('Content-Type','application/json');
 request.send(JSON.stringify({username: username, password: password}));  
    

   
};


 var register = document.getElementById('register_btn');
 register.onclick = function () {
     
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {

          if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                  alert('User created successfully');
                  register.value = 'Registered!';
              } else {
                  alert('Could not register the user');
                  register.value = 'Register';
              }

          }

        };
        
      var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/create-user', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        register.value = 'Registering...';

     
 };
