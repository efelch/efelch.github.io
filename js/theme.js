$(document).ready(function(){
    var classCycle=['background-image-1','background-image-2','background-image-3','background-image-4','background-image-5','background-image-6','background-image-7','background-image-8','background-image-9',];
    var randomNumber = Math.floor(Math.random() * classCycle.length);
    var classToAdd = classCycle[randomNumber];    
    $('body').addClass(classToAdd);
});
