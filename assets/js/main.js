class State {
	constructor(id, name, abbr){
		this.id = id;
		this.name = name;
		this.abbr = abbr;
	}
}

let states = [];

function onStateChosen(id) {
	$("#statesSelect").val(id);
	let mapStates = $("#mapFrame").contents().find("#states").children();
	mapStates.each((i, el) => {
		if (el.id == id){
			el.getElementsByTagName("path")[0].style.fill = "#1b5374";
			el.getElementsByTagName("text")[0].style.fill = "#ffffff";
		} else {
			el.getElementsByTagName("path")[0].style.fill = "";
			el.getElementsByTagName("text")[0].style.fill = "";
		}
	});
	let crime = $("#crimeSelect").val();
	fetchCrimeData(id, crime);
	$('html, body').animate({
        scrollTop: $("#results").offset().top
    }, 1000);
}

function onCrimeChosen(crime){
	let stateId = $("#statesSelect").val();
	fetchCrimeData(stateId, crime);
	$('html, body').animate({
        scrollTop: $("#results").offset().top
    }, 1000);
}

function fetchCrimeData(id, crime){
	let state = states.find(s => s.id === id);
	const canvas = document.getElementById("graphCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	$("#loadingOverlay").css("display", "flex");
	$("#graphHeader").text(state.name);
	$.ajax({
		url: `https://api.usa.gov/crime/fbi/sapi/api/nibrs/${crime}/offense/states/${state.abbr}/count?API_KEY=XyCV1kHIKb4ocjxafIzszP7k8cAfhsWWv4mKkPAU`,

	}).done(function(result){

		
		let data = result.data.filter(el => el.key === "Offense Count").map(el => {
			return {
				year: el.data_year,
				count: el.value
			}
		});
		if (data.length > 11){
			data = data.filter(el => el.year >= 2009);
		}
		
		if (!data || data.length === 0){
			showMessage("There are no data for the chosen state and crime.");
			document.getElementById("loadingOverlay").style.display = "none";
			return;
		}
		drawAxis(ctx, data);
		document.getElementById("loadingOverlay").style.display = "none";
	}).fail(function(){
		showMessage("Data could not be loaded!");
		document.getElementById("loadingOverlay").style.display = "none";
		return;
	})
}

function showMessage(messageText){
	$("#messageOverlay").css("display", "flex");
	$("#messageText").text(messageText);
}

function hideMessage(){
	$("#messageOverlay").css("display", "none");
}

// init
document.getElementById("mapFrame").onload = function(){
	let mapStates = $("#mapFrame").contents().find("#states").children();
	mapStates.each((index,element) => {
		let abbr = element.getElementsByTagName("text")[0].textContent;
		let id = element.id;
		let name = element.attributes['title'].nodeValue;
		$("#statesSelect").append(new Option(name, id));
		states.push(new State(id, name, abbr));
		element.addEventListener("click",function(){
			onStateChosen(id);
		});
	});

	$("#statesSelect").change(function(e) {
		onStateChosen(e.target.value);
	});
	$("#crimeSelect").change(function(e){
		onCrimeChosen(e.target.value);
	});
}


// Drawing Graph

const dummyData = [
    {year: "2001", count: 24},
    {year: "2002", count: 29},
    {year: "2003", count: 28},
    {year: "2004", count: 244},
    {year: "2005", count: 28},
    {year: "2006", count: 102},
];

const HEIGHT = 450;
const WIDTH = 740;
const OFFSET = {
	x: 55.5,
	y: 45.5
};
const ORIGIN = {
	x: OFFSET.x,
	y: HEIGHT - OFFSET.y
}

const X_AXIS_LENGTH = WIDTH - 2 * OFFSET.x;
const Y_AXIS_LENGTH = HEIGHT - 2 * OFFSET.y;

const FONT_SIZE = 14;
const FONT = `${FONT_SIZE}px Arial`


window.addEventListener("load", function(){
	
	const canvas = document.getElementById("graphCanvas");
	const ctx = canvas.getContext("2d");
	canvas.height = HEIGHT;
    canvas.width = WIDTH;

	drawAxis(ctx, dummyData)
	
})

function drawAxis(ctx, graphData){

	ctx.beginPath();
	ctx.moveTo(OFFSET.x,OFFSET.y);
	ctx.lineTo(ORIGIN.x, ORIGIN.y);

	ctx.lineTo(WIDTH-OFFSET.x, HEIGHT-OFFSET.y)
	ctx.strokeStyle = "#000000";
	ctx.stroke();

	const xPart = X_AXIS_LENGTH / graphData.length
	const yPart = Math.floor(Y_AXIS_LENGTH / 6);

	const yPartValue = computeYPartValue(graphData);
	const yPartMaxValue = yPartValue * graphData.length;

	const yAxisUsedLength = yPart * graphData.length;

	
	// X axis
	for (let i = 0; i < graphData.length; i++){
		if (i !== 0){
			ctx.beginPath();
			ctx.moveTo(ORIGIN.x + i*xPart, ORIGIN.y - 6);
			ctx.lineTo(ORIGIN.x + i*xPart, ORIGIN.y + 6);
			ctx.strokeStyle = "#000000";
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(ORIGIN.x + i*xPart, ORIGIN.y - 6);
			ctx.lineTo(ORIGIN.x + i*xPart, ORIGIN.y - Y_AXIS_LENGTH);
			ctx.strokeStyle = "#EEE";
			ctx.stroke();
		}
		
		ctx.font = FONT;
		ctx.fillStyle = "#000000";
		ctx.fillText(graphData[i].year.toString(), ORIGIN.x + i*xPart - FONT_SIZE, ORIGIN.y + FONT_SIZE + 7);
	}
	// Y axis
	for (let i = 0; i < 7; i++){
		if (i !== 0){
			ctx.beginPath();
			ctx.moveTo(ORIGIN.x + 6, ORIGIN.y - i*yPart);
			ctx.lineTo(ORIGIN.x - 6, ORIGIN.y - i*yPart);
			ctx.strokeStyle = "#000000";
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(ORIGIN.x + 6, ORIGIN.y - i*yPart);
			ctx.lineTo(ORIGIN.x + X_AXIS_LENGTH, ORIGIN.y - i*yPart);
			ctx.strokeStyle = "#EEE";
			ctx.stroke();
		}
		
		let textLength = (yPartValue * i).toString().length;
		ctx.font = FONT;
		ctx.fillStyle = "#000000";
		ctx.fillText((yPartValue * i).toString(), ORIGIN.x - FONT_SIZE - textLength * 6, ORIGIN.y - i*yPart - 6);
	}

	// draw points
	for (let i = 0; i < graphData.length; i++){
		let xPos = ORIGIN.x + i * xPart;
		let yPos = ORIGIN.y - (graphData[i].count / yPartMaxValue * yAxisUsedLength);
		ctx.beginPath();
		ctx.arc(xPos, yPos, 4, 0, 2 * Math.PI);
		ctx.fillStyle = "#002439";
		ctx.fill();
		let text = graphData[i].count.toString();
		ctx.fillText(text, xPos + 10, yPos - 10)
	}

	// draw lines between points
	for (let i = 0; i < graphData.length - 1; i++){
		let xPosStart = ORIGIN.x + i * xPart;
		let yPosStart = ORIGIN.y - (graphData[i].count / yPartMaxValue * yAxisUsedLength);
		let xPosEnd = ORIGIN.x + (i+1) * xPart;
		let yPosEnd = ORIGIN.y - (graphData[i+1].count / yPartMaxValue * yAxisUsedLength);
		ctx.beginPath();
		ctx.moveTo(xPosStart, yPosStart);
		ctx.lineTo(xPosEnd, yPosEnd);
		ctx.strokeStyle = "#1b5374";
		ctx.stroke();
	}
}


function computeYPartValue(data){
	let numbers = data.map(element => element.count);
	let max = Math.max(...numbers);
	let min = Math.min(...numbers);
	
	let yPart = Math.ceil((max/5)/10) * 10;
	return yPart;
}
