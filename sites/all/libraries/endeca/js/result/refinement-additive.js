
/* 
    This class is for supporting applications that DO NOT refresh their refinement list after selection by the user. 
    This allows the user to choose a refinement from a selectbox or a radio button without removing the other options.
    
    Doing this can be dangerous if there is no guarantee of products returning for ALL combinations of refinements. The user can end up selecting a combination of refinements that will return no results otherwise. It also does not allow for nested refinements. 


*/

generic.endeca.result.refinementAdditive = {
    onClick: function( event ) {
        var that = event.data.that;
        var link = that.resultData["Selection Link"];
        
        var linkN = site.endeca.helpers.string.toQueryParams( link )['N'];
        var linkNs = linkN ? linkN.split('+') : [];
        var currentN = site.endeca.helpers.string.toQueryParams( site.endeca.state || '' )['N'];
        var currentNs = currentN ? currentN.split('+') : [];

        for ( var i = 0; i < currentNs.length; i++ ) {
            if ( that.parent.refinementIDs[ currentNs[i] ] ) {
                currentNs.splice(i, 1);
            }
        }
        
        currentNs = currentNs.concat(linkNs);
        currentNs = site.endeca.helpers.array.unique(currentNs);
        event.data.link = link.replace( /N=[0-9+]*&/, "N=" + currentNs.join('+') + "&" );
        this._super( event );
        
    }
};

site.endeca.result.refinementAdditive = generic.endeca.result.refinementAdditive;
