var counter = 0;
var button = document.getElementById('counter');
button.onClick = function(){
    
    
  
  counter = counter + 1;
  var span = document.getElemntById('count');
  span.innerHTML = counter.toString();
    
};