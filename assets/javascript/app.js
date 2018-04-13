// Variable declarations
var main = $("body"),
    video = $('#host'),
    correct = 0,
    incorrect = 0,
    qCount = 29,
    countInterval,
    timeInterval,
    qInterval,
    clockRunning = false,
    categoryArr = [],
    categoryID = [],
    triviaCategories = [];

var currentQ = {
        q: "Question?",
        a1: "Answer 1",
        a2: "Answer 2",
        a3: "Answer 3",
        a4: "Answer 4",
    };

// Sound declarations
var coin = new Audio('assets/audio/coin.wav');
var wrong = new Audio('assets/audio/wrong.wav');
var message = new Audio('assets/audio/message.wav');


function categoryArrGen () {
    // Generate random number array for category IDs
    while(categoryArr.length < 6){
        var randomnumber = Math.floor(Math.random()*(32-9)) + 9;
        if(categoryArr.indexOf(randomnumber) > -1) continue;
        categoryArr[categoryArr.length] = randomnumber;
    }
    // Store categoryArr values for question retrieval in getQuestion
    categoryID = categoryArr.slice(0,7);

    // Initiate category API call
    $.ajax({url: 'https://opentdb.com/api_category.php', method: 'GET'})
        .done(function(response){
            console.log(response);
            triviaCategories = response.trivia_categories;
            console.log(triviaCategories);

            // Check category number array against retrieved list
            function catMatch(match) {
                return match.id === categoryArr[i];
            }
            // Replace category placeholder text
            for (i=0;i<categoryArr.length;i++) {
                var result = triviaCategories.find(catMatch);
                console.log(result);
                categoryArr[i] = result.name;

                // String length fixes (specific to this API)
                if (categoryArr[i].startsWith("Entertainment: Japanese") == true) {
                    var jpFix = categoryArr[i].replace('Entertainment: Japanese ','');
                    $('.category.cat'+(i+1)).html(jpFix);
                }
                else if (categoryArr[i].startsWith("Entertainment: Video") == true) {
                    var vidFix = categoryArr[i].replace('Entertainment: Video Games','Video<br>Games');
                    $('.category.cat'+(i+1)).html(vidFix);
                }
                else if (categoryArr[i].startsWith("Science: Mathematics") == true) {
                    var mathFix = categoryArr[i].replace('Science: Mathematics','Math');
                    $('.category.cat'+(i+1)).html(mathFix);
                }
                else if (categoryArr[i].startsWith("Science") == true) {
                    var sciFix = categoryArr[i].replace('Science: ','');
                    $('.category.cat'+(i+1)).html(sciFix);
                }
                else if (categoryArr[i].startsWith("Entertainment") == true) {
                    var entFix = categoryArr[i].replace('Entertainment: ','');
                    $('.category.cat'+(i+1)).html(entFix);
                }
                else {
                    $('.category.cat'+(i+1)).html(categoryArr[i]);
                }
            }
        });
}

// Initial category selection
categoryArrGen();

// Timer (modified stopwatch code)
var timer = {
    time: 0,

    reset: function () {
        timer.time = 20;
        $("#time").text("00:20");
    },

    start: function () {
        if (!clockRunning) {
            countInterval = setInterval(timer.count, 1000);
            timeInterval = setInterval(timer.timeUp, 20000);
            clockRunning = true;
          }
    },

    stop: function () {  
        clearInterval(timeInterval);
        clearInterval(countInterval);
        clockRunning = false;
    },

    timeUp: function() {
        // Display & Audio
        $('#question').html("Time up!<br>Answer: " + currentQ.a1);
        $("#time").text("00:00");
        wrong.play();

        // Clear timer intervals
        timer.stop();        
        
        // Get new question
        qInterval = setInterval(showBoard, 1000 * 3);
    },

    count: function() {
        timer.time--;
        var converted = timer.timeConverter(timer.time);
        $("#time").text(converted);
    },

    timeConverter: function(t) {

        var minutes = Math.floor(t / 60);
        var seconds = t - (minutes * 60);
    
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
    
        if (minutes === 0) {
          minutes = "00";
        }
        else if (minutes < 10) {
          minutes = "0" + minutes;
        }
    
        return minutes + ":" + seconds;
      }
};


// Get question
function showQuestion () {
    // Stop question change interval
    clearInterval(qInterval);

    // Set current question display
    $('#question').html(currentQ.q);
    $('#a1').html(currentQ.a1);
    $('#a2').html(currentQ.a2);
    $('#a3').html(currentQ.a3);
    $('#a4').html(currentQ.a4);
    $('#answers p.answer').shuffle();

    // Activate timer
    timer.reset();
    timer.start();
}

// Question click
$(main).on('click', '.question', function() {
    // Blank square value & remove question class
    $(this).html('').removeClass("question");

    // Add 1 to question count
    qCount++;

    // Retrieve question
    // Check value
    var diff = '';
    if ($(this).hasClass('200')==true || $(this).hasClass('400')==true) {
       diff = 'easy'; 
    }
    else if ($(this).hasClass('600')==true || $(this).hasClass('800')==true) {
        diff = 'medium'; 
    }
    else if ($(this).hasClass('1000')==true) {
        diff = 'hard'; 
    }

    // Check category
    var cat = '';
    for (i=0;i<7;i++) {
        if ($(this).hasClass('cat'+i)==true) {
            cat = categoryID[i-1];
        }
    }

    // API query for question
    $.ajax({url: 'https://opentdb.com/api.php?amount=1&category='+cat+'&difficulty='+diff+'&type=multiple', method: 'GET'})
        .done(function(response){
            var newQ = response.results;
            currentQ.q = newQ[0].question;
            currentQ.a1 = newQ[0].correct_answer;
            currentQ.a2 = newQ[0].incorrect_answers[0];
            currentQ.a3 = newQ[0].incorrect_answers[1];
            currentQ.a4 = newQ[0].incorrect_answers[2];

            // Display retrieved question
            showQuestion();

            // Show answers
            $('#answers').css("display", "");

            // Temporarily hide text
            $('.center').css({"display":"none"});
            var temp = setInterval(showText, 1000);
            function showText() {
                $('.center').css({"display":""});
                clearInterval(temp);
            }

            // Animate box
            $('#blankbox').css({"display":"block"}).addClass("grow");
            $('#blankbox').css({"width":"854px","height":"480px"});
            var growAway = setInterval(removeGrow, 1500);
            function removeGrow () {
                $('#blankbox').removeClass("grow");
                clearInterval(growAway);
            }

        });
});

// Answer click
$(main).on('click', '.answer', function() {
    // Hide answers
    $('#answers').css("display", "none");

    // If correct
    if (this.innerHTML == currentQ.a1) {

        // Display & Audio
        $('#question').html("Correct!<br>Answer: " + currentQ.a1);
        coin.play();
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(showBoard, 1000 * 2);
        correct++;
        
        // Point check & message
        console.log(correct);
        if (correct == 5) {
            $('#fiveCorrect').css("display", "block");
            var messageInt  = setInterval(hideMessage, 1000 * 3);
            function hideMessage () {
                $('#fiveCorrect').css("display", "none");
            }
            message.play();
        }
        if (correct == 10) {
            $('#tenCorrect').css("display", "block");
            var messageInt  = setInterval(hideMessage, 1000 * 3);
            function hideMessage () {
                $('#tenCorrect').css("display", "none");
            }
            message.play();
        }
        if (correct == 20) {
            $('#twentyCorrect').css("display", "block");
            var messageInt  = setInterval(hideMessage, 1000 * 3);
            function hideMessage () {
                $('#twentyCorrect').css("display", "none");
            }
            message.play();
        }
    }
    // If incorrect
    else {
        // Display & Audio
        $('#question').html("Incorrect!<br>Answer: " + currentQ.a1);
        wrong.play();
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(showBoard, 1000 * 4); 
        incorrect++;
    }
});

// Function to show board and final results
function showBoard () {
    // Hide question box
    $('#blankbox').css("display","none");

    // Reset animation
    $('#blankbox').css({"height":"0px","width":"0px"});

    // If all questions answered
    if (qCount>=30) {
        // Show final box
        $('#finalbox').css("display","block");
        $('#correct').html(correct);
        $('#incorrect').html(incorrect);
    }

}

// Shuffle elements
jQuery.fn.shuffle = function () {
    var j;
    for (var i = 0; i < this.length; i++) {
        j = Math.floor(Math.random() * this.length);
        $(this[i]).before($(this[j]));
    }
    return this;
};

function reset () {
    $('.200').html('$ 200').addClass("question");
    $('.400').html('$ 400').addClass("question");
    $('.600').html('$ 600').addClass("question");
    $('.800').html('$ 800').addClass("question");
    $('.1000').html('$ 1000').addClass("question");
    qCount = 0;
    categoryArr = [];
    categoryArrGen();
    $('#finalbox').css("display","none");

}


// To disable video (for debug)
$('#host').css("display", "none");
/*
// On load
$(document).ready(function() {
    // Play video
    video.trigger('play');

    // Play background music
    var bgmusic = new Audio('assets/audio/theme.mp3');
    bgmusic.loop = true;
    bgmusic.play();

    // Interval to hide video
    var vidInterval = setInterval(hideVideo, 1000 * 17);
    function hideVideo() {
        $('#host').css("display", "none");
        clearInterval(hideVideo);
    }

    // Message
    var msg = [ "Welcome to epperDJ!",
                "Let's play another exciting round!",
                "Please hire me!"];

    //Interval to start showing message
    var msgInterval = setInterval(startMsg, 1000 * 5.5);

    var msgCount = 0;

    // Start showing message
    function startMsg() {

        // Stop previous interval
        clearInterval(msgInterval);

        // Interval to stop letter display loop
        var stopTime = setTimeout(stopMsg, 100 * msg[msgCount].length + 1);

        // Letter display loop
        var letterInterval = setInterval(showMsg, 100);
        var i = 0;
        function showMsg() {
            $('#msgInner').append(msg[msgCount][i]);
            i++; 
        }

        // Stop letter display loop
        function stopMsg() {
            clearInterval(letterInterval);

            if (msgCount<3) {
                msgCount++;
            }

            // Hide message
            var wait = setInterval(hide, 1000 * 1.6);
            function hide() {
            $('#msgInner').html("");
            clearInterval(wait);
                // Next message
                if (msgCount<=2){
                startMsg();
                }
            }            
        }
    
    }
});
*/
