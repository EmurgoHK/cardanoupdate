import './sidebar.html'

Template.sidebar.events({
    'click .sidebar-minimizer': function() {
        $('body').toggleClass("sidebar-minimized")
    }
})


if ($(window).width() <= 768) { //Check Windows Size is small     
    $('body,html').click(function(event) {        
        if (event.target.className == "nav-link") //Filter sidebar menu click event
        {
            if ($('body').hasClass('sidebar-show')) {  //Check is showing sidebar
                $('body').removeClass("sidebar-show")   //Remove side bar
            }
        }        
    });
} 
