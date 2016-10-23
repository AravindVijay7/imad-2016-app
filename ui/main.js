console.log('Loaded!');

var img= document.getElementById('im');
var marginLeft = 0;
function moveRight(){
    marginLeft = marginLeft + 10;
    img.style.marginLeft + 'px';
}

img.onclick = function(){
    var interval = setInterval(moveRight,100);
};