
var generic = generic || {};

generic.errorStateClassName = 'error';

/**
 * This method displays error messages. It takes an array of error objects and a UL node
 * as parameters. If the UL is not spuulied, it will attempt to find a <UL class="error_messages">
 * in the DOM. It will then attempt to insert one directly after a <DIV id="header"> (If no header
 * is found, the method exits.) All the LI child nodes (previous messages) of the UL are hidden.
 * The text property of each error Hash is then displayed as an LI.
 * This method can also alter the style of the input elements that triggered the error.
 * The tags property in an error hash must be an array that contains a string starting with
 * "field." If the optional formNode parameter is supplied, this form node will be
 * searched for the field, and that field will be passed to the generic.showErrorState method.
 * @example
 * var errArray = [
 *      {
 *          "text": "Last Name Alternate must use Kana characters.",
 *          "display_locations": [],
 *          "severity": "MESSAGE",
 *          "tags": ["FORM", "address", "field.last_name_alternate"],
 *          "key": "unicode_script.last_name_alternate.address"
 *      },
 *      {
 *          "text": "First Name Alternate must use Kana characters.",
 *          "display_locations": [],
 *          "severity": "MESSAGE",
 *          "tags": ["FORM", "address", "field.first_name_alternate"],
 *          "key": "unicode_script.first_name_alternate.address"
 *      }
 *  ];
 * var listNode = $$("ul.error_messages")[0];
 * generic.showErrors(errArray, listNode);
 * @param {Array} errorObjectsArray Array of error hashes.
 * @param {DOM Node UL} errListNode UL element in which the error messages will be displayed.
 * @param {DOM Node} formNode Form element (or any container node) that contains the inputs
 * to be marked as being in an error state.
 */
generic.showErrors = function(errorObjectsArray, errListNode, formNode) {

    var ulNode = errListNode != null ? errListNode : $("ul.error_messages");
    // prototype version acted on a single node. This could be a list
    // so cut it down to avoid redundant messaging in places. i.e - signin
    ulNode = $(ulNode[0]);

    // TEST that pre-exisiting ul.error_messages is selected as container
    if ( $("ul.error_messages").length == 0 ) {
        var header = $("div#header");
        if (  header.length == 0  ) {
            return null;
            // TEST that DOM w/o div#header gets no error list (no ulNode parameter in method call)
        } else {
            $("<ul class='error_messages'></ul>").insertAfter(header);
            ulNode =  $(".error_messages");
            // TEST that DOM with div#header adds ul.error_messages after div#header)
        }
    }
    var errListItemNodes = ulNode.children("li");

    errListItemNodes.hide();
    // TEST that pre-exisiting, visible ul.error_messages LI's are hidden
    if (errorObjectsArray.length > 0 ){
        // hide all error states on fields
        formNode = $(formNode);
        var inputNodes = formNode.children("input, select, label");
        inputNodes.each( function () {
            generic.hideErrorState(this);
        });
        // TEST setup: input, select, label elements in formNode have class name "error"
        // test that the class name gets removed from those elements
    }
    for (var i=0, len=errorObjectsArray.length; i<len; i++) {
        var errObj = errorObjectsArray[i];
        var errKey = errObj.key;
        var errListItemNode = [];
        if (errKey) {
            var regEx = new RegExp(errKey);
            // try to find LI whose ID matches the error key
            errListItemNode = errListItemNodes.filter( function() {
                return regEx.test(this.id);
            });
        }

        if (errListItemNode.length > 0) {
            // TEST setup: LI with id that matches error key is already in UL, hidden.
            // Test that the LI gets shown when matching key is found amoung error objects.
            errListItemNode.show();
        } else {
            // TEST setup: no matching LI is in UL. LI gets created with matching key and added to UL.
            errListItemNode = $("<li/>");
            errListItemNode.html(errObj.text);
            ulNode.append( errListItemNode );

        }
        if (errObj.displayMode && errObj.displayMode === "message") {
            // TEST setup: error object has displayMode="message"
            // Test that matching LI gets class name "message"
            errListItemNode.addClass("message");
        }
        if (errObj.tags && $.isArray(errObj.tags)) {
            // search through error objects, show error state for any tagged with "field.[NAME]"
            var fieldPrefixRegEx = /^field\.(\w+)$/;
            for (var j=0, jlen=errObj.tags.length; j<jlen; j++) {
                var tag = errObj.tags[j];
                var reResults = tag.match(fieldPrefixRegEx);
                if ( reResults && reResults[1] ) {
                    var fieldName = reResults[1].toUpperCase();
                    var inputNode = $("input[name=" + fieldName + "], select[name=" + fieldName + "]" , formNode);
                    if (inputNode.length > 0) {
                        generic.showErrorState(inputNode[0]);
                        var labelNode = $("label[for=" + inputNode[0].id + "]", formNode);
                        generic.showErrorState(labelNode[0]);
                    }
                }
            }
            // TEST setup: error object has "tags" = ["field.last_name"]; formNode contains a label & an input tag with name=last_name
            // Test that the tags get className "error"
        }
    }
    ulNode.show();
    ulNode.addClass("error_messages_display");
    // TEST ulNode should be visible & have classname = error_messages_display
};
generic.showErrorState = function( /* DOM Node */ inputNode) {
    if (!inputNode || !generic.isElement(inputNode)) {
        return null;
    }
    $(inputNode).addClass(generic.errorStateClassName);
}
generic.hideErrorState = function( /* DOM Node */ inputNode) {
    if (!inputNode || !generic.isElement(inputNode)) {
        return null;
    }
    $(inputNode).removeClass(generic.errorStateClassName);
}



