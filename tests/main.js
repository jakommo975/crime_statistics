window.addEventListener("load", () => {
    const canvas = document.getElementById("myCanvas");

    const ctx = canvas.getContext("2d");

    canvas.height = 400;
    canvas.width = 600;


	ctx.beginPath();
	ctx.moveTo(10.5,10.5);
	ctx.strokeStyle = "#000000"
	ctx.lineTo(10.5,100.5);
	ctx.stroke()
})

