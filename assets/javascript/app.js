// Variable declarations
var main = $("body"),
    video = $('#host'),
    correct = 0,
    incorrect = 0,
    qCount = 0,
    currentQ = "",
    countInterval,
    timeInterval,
    qInterval,
    clockRunning = false;

var questions = [
    q1 = {
        q: "What is what?",
        a1: "What",
        a2: "Where",
        a3: "When",
        a4: "How",
        correct: "Where"
    }
];

// Get question
function getQuestion () {
    // Stop question change interval
    clearInterval(qInterval);

    // Update remaining questions
    var qRemaining = questions.length - qCount;

    // Set current question display
    currentQ = questions[qCount];
    $('#question').html(currentQ.q);
    $('#a1').html(currentQ.a1);
    $('#a2').html(currentQ.a2);
    $('#a3').html(currentQ.a3);
    $('#a4').html(currentQ.a4);

    // Activate timer
    timer.reset();
    timer.start();
}

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

// Button click
$(main).on('click', '.answer', function() {
    // If correct
    if (this.innerHTML == currentQ.correct) {
        // Display
        $('#question').html("Correct!<br>Answer: " + currentQ.correct);
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(getQuestion, 1000 * 5);
    }
    // If incorrect
    else {
        // Display
        $('#question').html("Incorrect!<br>Answer: " + currentQ.correct);
        // Stop answer timer & start question change timer
        timer.stop();
        qInterval = setInterval(getQuestion, 1000 * 5); 
    }
});

// Start button
$(main).on('click', '#start', function() {
    // Start game
    getQuestion();

    // Hide button
    $('#start').css({display: "none"});
});

// On load
$(document).ready(function() {
    // Play video
    video.trigger('play');

    console.log(video.volume);

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
            console.log(msg[msgCount][i]);
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
