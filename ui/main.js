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



$(function(){
    jQuery(document).ready(function() {
    $('#home').backstretch([
       "ui/main.jpg", 
       "ui/sub.png",
        ],  {duration: 2000, fade: 750});
    });
  });

});

//name ip

//var nameInput = document.getElementById('name');
// var name = nameInput.value;
//var submit = document.getElementById('submit_btn');
//submit.onClick = fuction(){
    
    
//};