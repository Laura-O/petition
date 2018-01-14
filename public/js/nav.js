$(document).ready(function() {
    $(".toggleNav").on("click", function() {
        $(".flex-nav ul").toggleClass("open");
    });

    function moveKoopa() {
        let screenWidth = $(document).width();

        $("#koopa-gif").css("left", screenWidth);
        $("#koopa-gif").animate({ left: -100 }, 30000, "linear");

        setInterval(function() {
            moveKoopa();
        }, 31000);
    }

    moveKoopa();
});
