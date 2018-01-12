$(document).ready(function() {
    const $canvas = $("#canvas");
    let context = $canvas[0].getContext("2d");
    let draw = false;
    let clickX = [];
    let clickY = [];
    let clickMove = [];

    $canvas.on("mousedown", function(e) {
        let mouseX = e.pageX - $canvas.offsetLeft;
        let mouseY = e.pageY - $canvas.offsetTop;

        draw = true;
        newStroke(mouseX, mouseY, false);
        redraw();
    });

    $canvas.on("mousemove", function(e) {
        if (draw) {
            newStroke(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    });

    $canvas.on("mouseup", function(e) {
        draw = false;
        redraw();
    });

    $canvas.on("mouseleave", function(e) {
        draw = false;
    });

    $("#submit").on("click", function(e) {
        let signature = document.getElementById("canvas").toDataURL();
        document.getElementById("hidden-signature").value = signature;
    });

    function newStroke(x, y, moving) {
        clickX.push(x);
        clickY.push(y);
        clickMove.push(moving);
    }

    function redraw() {
        context.clearRect(0, 0, $canvas.width, $canvas.height);

        context.strokeStyle = "black";
        context.lineJoin = "round";
        context.lineWidth = 5;

        for (let i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickMove[i]) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }

            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }
});
