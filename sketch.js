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

function playpause() {
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
        if (i < womenDots) {
            fill('purple');
            stroke('purple');
        } else {
            fill(200);
            stroke(200);
        }

        ellipse(x * 38 + 20, y * 38 + 20, 30, 30);

        // move along, and start a new row when this one is full
        x++;
        if (x >= 10) {
            x = 0;
            y++;
        }
    }

    // RIGHT GRID - female graduation rate
    // start again at the top, 460 pixels to the right
    x = 0;
    y = 0;

    for (let i = 0; i < 100; i++) {

        // graduates first, then everyone else
        if (i < graduateDots) {
            fill('purple');
            stroke('purple');
        } else {
            fill(200);
            stroke(200);
        }

        ellipse(460 + x * 38 + 20, y * 38 + 20, 30, 30);

        // move along, and start a new row when this one is full
        x++;
        if (x >= 10) {
            x = 0;
            y++;
        }
    }

    // print the numbers for this year into the table
    const tbody = document.querySelector('#dataTable tbody');

    tbody.innerHTML = `
        <tr>
            <td>${row.Country}</td>
            <td>${row.Year}</td>
            <td>${row.FemaleEnrollment}</td>
            <td>${row.FemaleGraduationRate}</td>
            <td>${row.STEMFields}</td>
            <td>${row.GenderGapIndex}</td>
        </tr>
    `;
}

// the lower the share of women, the lower the beat
function changeBeat() {
    let percent = cleanNumber(currentRow.FemaleEnrollment);

    beat.stop();

    if (percent < 30) {
        beat = beatLow;
    }
    else if (percent < 50) {
        beat = beatMid;
    }
    else {
        beat = beatHigh;
    }

    beat.loop();
    analyzer.setInput(beat);
}

// goes through every row and keeps the one for the current year
function findYear() {
    let count = 0;

    rows.forEach(row => {
        if (count >= yearIndex && count < yearIndex + 1) {
            currentRow = row;
        }
        count++;
    });
}

function cleanNumber(value) {
    return Number(
        String(value).replace(/[^0-9.-]/g, '')
    );
}
