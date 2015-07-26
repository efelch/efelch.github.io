$(document).ready(function(){
    bgImageTotal=9;
    randomNumber = Math.round(Math.random()*(bgImageTotal-1))+1;
    imgPath=('img/img'+randomNumber+'.jpg');
    $('.site-wrapper').css(
    	{
    		"-webkit-background-size": "cover",
			"-moz-background-size": "cover",
			"-o-background-size": "cover",
			"background-size": "cover",
			"background" : "url('"+imgPath+"') no-repeat center center fixed"	
    	}
    	);
});
