
var button = document.getElementById('c1');

button.onClick = function(){
    
 var request = new XMLHttpRequest();
 
 
 request.onreadystatechange = function(){
     if(request.readystate == XMLHttpRequest.DONE){
         if(request.status == 200){
             var c1 = request.responseText;
             var span = document.getElementById('c2');
             span.innerHTML = counter.toString();
         }
     }
     
 };
  
 request.open('GET','http://http://aravindvijay7.imad.hasura-app.io/counter', true);
 request.send(null);
    
};