//counter
var button = document.getElementById('counter');

button.onclick = function(){
    
 var request = new XMLHttpRequest();
 
 
 request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE){
         if(request.status === 200){
             var counter = request.responseText;
             var span = document.getElementById('count');
             span.innerHTML = counter.toString();
         }
     }
     
 };
  
 request.open('GET','http://aravindvijay7.imad.hasura-app.io/counter', true);
 request.send(null);
    
};


//name input
 var nameInput = document.getElementById('name');
 var name = nameInput.value;
 var submit = document.getElementById('submit_btn');
 submit.onclick  = fuction(){
     
     
 
 request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE){
         if(request.status === 200){
             var names = ['name1','name2','name3'];
             var list = '';
             for(var i = 0 ; i<names.length; i++){
                 var ul = document.getElementById('namelist');
                 ul.innerHTML = list;
             }
             
             
             
         }
     }
     
 };
  
 request.open('GET','http://aravindvijay7.imad.hasura-app.io/submit-name?name=' + name, true);
 request.send(null);
    
    
}