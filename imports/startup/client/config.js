SubsCache = new SubsCache(5, 10)

if ($(window).width() <= 768) {
    $('body, html').click(function(_event) {
        if ($('body').hasClass('sidebar-show') && !$(_event.target).hasClass('nav-dropdown-toggle')) {
            $('body').toggleClass("sidebar-show")
        }
    });

    $('a.nav-link').click(function (event) {
        event.stopPropagation();
    })
}
