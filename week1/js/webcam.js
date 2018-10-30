var WEBCAM = document.getElementById('webcam');
var FACE_FRAME = document.getElementById('webcam_frame');
var CANVAS_FRAME = document.getElementById('canvas_webcam');
var CANVAS_FRAME_CTX = CANVAS_FRAME.getContext('2d');
var CANVAS_FACE = document.getElementById('face_profile_chart');
var CANVAS_FACE_CTX = CANVAS_FACE.getContext('2d');
var CANVAS_FACE_GREY = document.getElementById('face_profile_greyscale');
var CANVAS_FACE_GREY_CTX = CANVAS_FACE_GREY.getContext('2d');
var CHART_EMOTION;
var CHART_GENDER;
var EXPAND_BOX = {
    'x': 0,
    'y': 0,
    'w': 0,
    'h': 0
};
var TRACKER = new tracking.ObjectTracker(['face']);
TRACKER.setEdgesDensity(0.1);
TRACKER.setInitialScale(4);
TRACKER.setStepSize(1);
var GENDER_STATUS = '';
var TW = ['Which politician inspires you?','Which controversial politician do you admire?','What do you do to stay organized?','What is your favorite professional app?','Do you workout before or after work?'];
var DW = ['Text/call a colleague out for a drink','Cancel a meeting/office hour','Call in sick for work the next day/email a prof that you’ll miss a class','Give your phone to someone in the room and let them text your colleague/email your prof','Sell a piece trash to someone in the group.'];
var TM = ['What’s something kinky that you like','Tell us about the most awkward date you’ve been on','What’s the most embarrassing photo you have on social media?','Who in the room you do you find attractive?','Have you ever cheated on someone?'];
var DM = ['Kiss someone’s hand','Kiss someone’s leg','Tell someone to smile','Get a stranger’s number','Take off your shirt'];

 

$(document).ready(function () {

    tracking.track('#webcam', TRACKER, {
        camera: true
    });
    setTimeout(function () {
        setCanvasFrameSize();
    }, 3000);
    initChart();

    if (window.screen.availWidth > 900) {
        //EXPAND_BOX = {'x': -5, 'y': -5, 'w': 5, 'h': 5};
    }

});



TRACKER.on('track', function (faces) {

    CANVAS_FRAME_CTX.clearRect(0, 0, CANVAS_FRAME.width, CANVAS_FRAME.height);

    if (faces.data.length == 0 ||
        IS_MODEL_GENDER_LOADED == false ||
        IS_MODEL_EMOTION_LOADED == false) {
        return;
    }

    var rect = faces.data[0];

    rect.x = rect.x - EXPAND_BOX.x;
    rect.y = rect.y - EXPAND_BOX.y;
    rect.width = rect.width + EXPAND_BOX.w;
    rect.height = rect.height + EXPAND_BOX.h;

    drawFaceFrame(rect);
    cropFace(rect);

    var result_emotion = getResultEmotion(CANVAS_FACE_GREY);
    var result_gender = getResultGender(CANVAS_FACE_GREY);
    updateResultChart(result_emotion, result_gender);

    //console.log(result_gender);


    document.addEventListener("keydown", function (e) {

        console.log(e.keyCode);
        if(e.keyCode == '32') {
            document.getElementById('emoji').innerHTML = '&nbsp;( ͡° ͜ʖ ͡°)';
            document.getElementById('td-text').innerHTML = 'Truth or Dare?<br/>Press T or D';
            return GENDER_STATUS = result_gender.label;
            
        }
        if(e.keyCode == '84' || e.keyCode == '68') {
            console.log(GENDER_STATUS);
            PLAY(GENDER_STATUS, e.keyCode);
        }

    });

    // var range = Math.floor(Math.random() * (max - min + 1)) + min;

    function PLAY(gender, key) {
        document.getElementById('emoji').innerHTML = '&nbsp༼つ ͡° ͜ʖ ͡°༽つ';

        var range = Math.floor(Math.random() * 4); // 18

        if(gender == 'Man' && key == '84') {
            document.getElementById('td-text').innerHTML = TM[range];
        } else if(gender == 'Man' && key == '68') {
            document.getElementById('td-text').innerHTML = DM[range];
        }
        if(gender == 'Woman' && key == '84') {
            document.getElementById('td-text').innerHTML = TW[range];
        } else if(gender == 'Woman' && key == '68') {
            document.getElementById('td-text').innerHTML = DW[range];
        }
    }



    // window.addEventListener("keypress", checkKeyPressed, false);

    // function checkKeyPressed(e) {
    //     if (e.keyCode == '32') {
    //         //GAME_START();
    //         console.log('key pressed');
    //         // console.log(GENDER_STATUS);
    //         //GAME_START(GENDER_STATUS);
    //     }
    //     if (e.keyCode == '84') {
    //         console.log('td pressed');
    //         //console.log(G);
    //     }
    // }
});

function GAME_START(gender) {
    if (gender == 'Man') {
        console.log("Howdy");
        return G = 'Man';
        // TD_MAN();
    } else {
        console.log("Hi~");
        return G = 'Woman';
        // TD_WOMAN();
    }
}



// function TD_MAN() {
//     console.log("td for man");
//     window.addEventListener("keypress", tdKeyPressed, false);

//     function tdKeyPressed(e) {
//         if (e.keyCode == '84') {
//             console.log('t is pressed');
//         }
//     }
// }

// function TD_WOMAN() {
//     console.log("td for woman");
//     window.addEventListener("keypress", tdKeyPressed, false);

//     function tdKeyPressed(e) {
//         if (e.keyCode == '68') {
//             console.log('d is pressed');
//         }
//     }
// }

function setCanvasFrameSize() {

    var w = $('#webcam').width();
    var h = $('#webcam').height();
    CANVAS_FRAME.width = w;
    CANVAS_FRAME.height = h;
}

function drawFaceFrame(rect) {

    CANVAS_FRAME_CTX.strokeStyle = '#a64ceb';
    CANVAS_FRAME_CTX.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

function cropFace(rect) {

    var x = rect.x
    var y = rect.y;
    var w = rect.width;
    var h = rect.height;

    var w_w = $(WEBCAM).width();
    var w_h = $(WEBCAM).height();
    var video_w = WEBCAM.videoWidth;
    var video_h = WEBCAM.videoHeight;

    var ratio = video_w / w_w;
    //console.log(ratio);

    CANVAS_FACE_CTX.drawImage(WEBCAM, x * ratio, y * ratio, w * ratio, h * ratio, 0, 0, 64, 64);

    //Convert Image to Greyscale
    var imageData = CANVAS_FACE_CTX.getImageData(0, 0, CANVAS_FACE.width, CANVAS_FACE.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    CANVAS_FACE_GREY_CTX.putImageData(imageData, 0, 0);
}

function getResultEmotion(im) {
    var input = preprocess_input(im);
    var result = predictEmotion(input);
    return result;
}

function getResultGender(im) {
    var input = preprocess_input(im);
    var result = predictGender(input);
    return result;
}

function updateResultChart(result_emotion, result_gender) {
    //console.log(result_emotion);
    //console.log(result_gender);
    CHART_GENDER.data.datasets[0].label = 'Gender: ' + result_gender.label;
    CHART_GENDER.data.datasets[0].data = result_gender.result;
    CHART_GENDER.update(50);

    CHART_EMOTION.data.datasets[0].label = 'Emotion: ' + result_emotion.label;
    CHART_EMOTION.data.datasets[0].data = result_emotion.result;
    CHART_EMOTION.update(50);
}

function initChart() {
    var options = {
        /*"animation": false,*/
        "responsive": true,
        "maintainAspectRatio": false,
        "scales": {
            "xAxes": [{
                "ticks": {
                    "beginAtZero": true
                }
            }]
        }
    };

    CHART_EMOTION = new Chart(document.getElementById('chart_emotion'), {
        type: 'horizontalBar',
        data: {
            "labels": [
                "Angry",
                "Disgust",
                "Fear",
                "Happy",
                "Sad",
                "Surprise",
                "Neutral"
            ],
            "datasets": [{
                "label": "Emotion: ",
                "data": [0, 0, 0, 0, 0, 0, 0],
                "fill": false,
                "backgroundColor": [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(201, 203, 207, 0.2)"
                ],
                "borderColor": [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(201, 203, 207)"
                ],
                "borderWidth": 1
            }]
        },
        options: options
    });

    CHART_GENDER = new Chart(document.getElementById('chart_gender'), {
        type: 'horizontalBar',
        data: {
            "labels": [
                "Woman",
                "Man",
            ],
            "datasets": [{
                "label": "Gender: ",
                "data": [0, 0],
                "fill": false,
                "backgroundColor": [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                ],
                "borderColor": [
                    "rgb(255, 99, 132)",
                    "rgb(75, 192, 192)",
                ],
                "borderWidth": 1
            }]
        },
        options: options
    });

}