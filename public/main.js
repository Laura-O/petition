$(document).ready(function() {
    // Canvas
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

    // Submit

    $("#submit").on("click", function(e) {
        var signatureForm = document.getElementById("signature-form");

        let firstName = signatureForm.first.value;
        let lastName = signatureForm.last.value;
        let signature = document.getElementById("canvas").toDataURL();

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            url: "http://localhost:8080/petition",
            type: "POST",
            data: {
                firstName: firstName,
                lastName: lastName,
                signature: signature,
            },
            success: function(data) {
                console.log("success");
                console.log(JSON.stringify(data));
            },
        });
    });
});
