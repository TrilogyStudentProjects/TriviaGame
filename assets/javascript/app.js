// Variable declarations
var main = $("body"),
    video = $('#host'),
    correct = 0,
    incorrect = 0,
    qCount = 0,
    countInterval,
    timeInterval,
    qInterval,
    clockRunning = false,
    categoryArr = [],
    categoryID = [],
    triviaCategories = [];

var currentQ = {
        q: "What is what?",
        a1: "What",
        a2: "Where",
        a3: "When",
        a4: "How",
    };


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
            triviaCategories = response.trivia_categories;

            // Check category number array against retrieved list
            function catMatch(match) {
                return match.id === categoryArr[i];
            }
            // Replace category placeholder text
            for (i=0;i<categoryArr.length;i++) {
                var result = triviaCategories.find(catMatch);
                categoryArr[i] = result.name;

                // String length fixes
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
        // Display
        $('#question').html("Time up!<br>Answer: " + currentQ.correct);
        $("#time").text("00:00");

        // Clear timer intervals
        timer.stop();        
        
        // Get new question
        qInterval = setInterval(getQuestion, 1000 * 5);
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
    for (i=0;i<5;i++) {
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
            console.log(currentQ);

            // Display retrieved question
            showQuestion();
            $('#blankbox').css("display", "block");
        });


});

// Answer click
$(main).on('click', '.answer', function() {
    // If correct
    if (this.innerHTML == currentQ.a1) {
        // Display
        $('#question').html("Correct!<br>Answer: " + currentQ.a1);
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(showBoard, 1000 * 2);
    }
    // If incorrect
    else {
        // Display
        $('#question').html("Incorrect!<br>Answer: " + currentQ.a1);
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(showBoard, 1000 * 4); 
    }
});

function showBoard () {
    $('#blankbox').css("display","none");
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

//delete me when reactivating video
$('#host').css("display", "none");
/*
// On load
$(document).ready(function() {
    // Play video
    video.trigger('play');

    // Play background music
    var bgmusic = new Audio('assets/audio/theme.mp3');
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
