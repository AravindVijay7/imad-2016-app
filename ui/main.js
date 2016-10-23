console.log('Loaded!');

var img= document.getElementById('im');

function moveRight(){
    marginLeft = marginLeft + 10;
    img.style.marginLeft + 'px';
}

img.onclick = function(){
    var interval = setInterval(moveLeft,100);
}