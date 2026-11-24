let beat, analyzer;
let beatLow, beatMid, beatHigh;

// array to hold the rows from the csv file
const rows = [];
let totalYears = 0;
let currentRow;

// which year we are on and a counter to move to the next year
let yearIndex = 0;
let timer = 0;

// Load sound files before canvas loads so they are ready
function preload() {
    beatLow = loadSound('beat_low.wav');
    beatMid = loadSound('beat_mid.wav');
    beatHigh = loadSound('beat_high.wav');
    beat = beatLow;
}

function setup() {
    let myCanvas = createCanvas(900, 550);
    myCanvas.parent('myContainer');

    analyzer = new p5.Amplitude();
    analyzer.setInput(beat);

    // read in the data
    Papa.parse('womencs.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("running");
            console.log(results.data);

            results.data.forEach(row => {
                rows.push(row);
                totalYears++;
            });
        },

        error: function(err) {
            console.error("FAILED");
            console.error(err);
        }
    });
}

function mousePressed() {
    if (beat.isPlaying()) {
        beat.stop();
    } else {
        beat.loop();
        findYear();
        drawDots();
    }
}

function draw() {

    // only run while the beat is playing
    if (beat.isPlaying()) {

        // move on to the next year every 60 frames (about one second)
        timer++;
        if (timer > 60) {
            timer = 0;
            yearIndex++;

            // go back to the start after the last year
            if (yearIndex >= totalYears) {
                yearIndex = 0;
            }

            findYear();
            drawDots();
            changeBeat();
        }

        let percent = cleanNumber(currentRow.FemaleEnrollment);
        let percent2 = cleanNumber(currentRow.FemaleGraduationRate);

        // Get the average (root mean square) amplitude
        let rms = 0
        if (analyzer.getLevel()){
            rms = analyzer.getLevel();
        }

        // remove the last circles
        erase();
        ellipse(200, 475, 140, 140);
        ellipse(660, 475, 140, 140);
        noErase();

        fill('purple');
        stroke(0);

        // Draw a circle for each with size based on the percentage and the volume
        ellipse(200, 475, percent * 1.5 + rms * 30, percent * 1.5 + rms * 30);
        ellipse(660, 475, percent2 * 1.5 + rms * 30, percent2 * 1.5 + rms * 30);
    }
}

// draws two grids of 100 dots - enrollment on the left, graduation on the right
function drawDots() {
    let row = currentRow;
    let womenDots = cleanNumber(row.FemaleEnrollment);
    let graduateDots = cleanNumber(row.FemaleGraduationRate);

    // clear the whole canvas before drawing the new year
    erase();
    ellipse(width / 2, height / 2, 1200, 1200);
    noErase();

    // LEFT GRID - female enrollment
    // go along each row of the dot field, then down to the next row
    let x = 0;
    let y = 0;

    for (let i = 0; i < 100; i++) {

        // women's dots first, then men's dots
        if (i
