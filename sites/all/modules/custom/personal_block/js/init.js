jQuery( function() {

    // Call the touts class on every page load.
    var userTouts = site.profile.touts();
    userTouts.set({
        ruleAttr    : 'data-profile-rule',
        dataAttr    : 'data-profile-options'
    });

});
