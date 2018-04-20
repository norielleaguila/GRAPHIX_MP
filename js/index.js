var name;
var ctr = 0;
var gameEnd = false;
var timeleft = 5;
var score = 0;

var letters = [];
var chosen = [];
var currIndex = 0;

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

    $("#close").click(function(){
        $("#letterContainer").hide();
        currIndex = 0;
    });

    $("#viewBtn").click(function(){
        $("#letterContainer").show();
        loadLetter(chosen[currIndex]);
    });

    $("#next").click(function(){
        currIndex++;
        if(currIndex > chosen.length -1)
            currIndex = 0;
        loadLetter(currIndex);
    });

    $("#prev").click(function(){
        currIndex--;
        if(currIndex < 0)
            currIndex = chosen.length - 1;
        loadLetter(currIndex);
    })

});

function loadLetter(index){
    $("#letterContainer").find('.letter').remove();
    $("#letterContainer").prepend(letters[chosen[index]]);
}

function startTimer(){
    var clickTimer = setInterval(function(){
        document.getElementById("progressBar").value = 10 - --timeleft;
        if(timeleft < 0){
            clearInterval(clickTimer);
            gameEnd = true;
            $("#gameContainer").hide();
            score = Math.floor(ctr / 10);
            $("#score").text("Letters Sent: " + score);

            $("#scoreContainer").show();

            chooseLetters();
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

    // $("#letterContainer").prepend(
    //     "<div id=letter"+ id + " class='letter'>" +
    //     "To: " + to + "<br/>" +
    //     "From: " + from + "<br/>" + "<br/>" +
    //     message +
    //     "</div>"
    // );

    var letter =
    "<div id=letter"+ id + " class='letter'>" +
    "To: " + to + "<br/>" +
    "From: " + from + "<br/>" + "<br/>" +
    message +
    "</div>";

    // var lid = "#letter" + id;

    letters.push(letter);
}

function chooseLetters(){
    for(var i = 0; i < score; i++){
        var index = Math.floor(Math.random() * 21);
        chosen.push(index);
    }
}
