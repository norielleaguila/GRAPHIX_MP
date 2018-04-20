var name;
var ctr = 0;
var gameEnd = false;
var timeleft = 10;
var score = 0;

$(document).ready(function(){
    loadLetters();

    $('#goBtn').click(function(){
        if($('#nameIn').val() !== ""){
            $('#welcomeContainer').hide();

            name = $('#nameIn').val();

            $('#inst').text($('#inst').text() + name + "!");

            $('#gameContainer').show();

            startTimer();
        }
    });

    $('#gameContainer').click(function(){
        if(!gameEnd){
            ctr++;
            $('#clickCtr').text(ctr + " clicks");
        }
    });

});

function startTimer(){
    var clickTimer = setInterval(function(){
        document.getElementById("progressBar").value = 10 - --timeleft;
        if(timeleft < 0){
            clearInterval(clickTimer);
            gameEnd = true;
            $("#gameContainer").hide();
            score = Math.floor(ctr / 10);
            $("#score").text("Letters Sent: " + score);
        }
    },1000);
}

function loadLetters(){
    $.ajax({
        url: 'letter.json',
        type: 'get',
        dataType: 'json',
        error:
        function(data){
        },
        success:
        function(data){
            for(var i = 0; i < data.length; i++){
                createLetter(data[i]);
            }
        }
    });
}

function createLetter(letter){
    var id = letter.id;
    var to = letter.to;
    var from = letter.from;
    var message = letter.message;

    // console.log(message);
}

function randPos(){
    
}
