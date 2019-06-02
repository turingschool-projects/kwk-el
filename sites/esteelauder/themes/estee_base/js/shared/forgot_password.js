
/**
 * @namespace
 */
var site = site || {};
site.signin = site.signin || {};
site.panels = site.panels || {};

/**
    * One-time call to collect specific RB Keys used for forget password.
    * @methodOf site.signin
*/
site.signin.getRBKeys = function() {
    site.signin.rb = generic.rb("error_messages");
	site.signin.forgotPasswordEmailNotFound = site.signin.rb.get('no_account') != 'no_account' ? site.signin.rb.get('no_account') : 'We do not have an account associated with that email address. Please sign in as a new customer.';
	site.signin.forgotPasswordNoEmailProvided = site.signin.rb.get('invalid_email') != 'invalid_email' ? site.signin.rb.get('invalid_email') :  'Please enter an email address in the following format: jane@aol.com.';
    site.signin.forgotPasswordMigratedUser = site.signin.rb.get('migrated.mobile_account.signin');
};

/**
    * This method is used to set up the forget password functionality
    * on the site.
    * Takes the passed element in the DOM and gets the required form
    * nodes and places them within forgotPassArgs object.
    * site.signin.setForgetPassword() is then called if the param resetPassword
    * is set to true.
    * @param {Object} args
    * @param {Object} args.emailNode **REQUIRED** DOM element of either a
    * form element or wrapper element of the email.
    * @param {Object} args.errorListNode **REQUIRED** DOM element used to show
    * password hint or error messaging if hint is not available.
    * @param {Object} args.forgotPasswordLink **REQUIRED** DOM element of the
    * forget password link.
    * @params {element} forget link node set on dom:load
    * @methodOf site.signin
*/
site.signin.forgotPassword = function(args) {

    if ((args.emailNode.length > 1) || (!args.forgotPasswordLink) || (!args.errorListNode) ) {
        return null;
    }
    site.signin.getRBKeys();

    var errorListNode = args.errorListNode;
    var emailNode = args.emailNode;
    var forgotPasswordLink = args.forgotPasswordLink;
    var forgotPasswordNote = args.forgotPasswordNote;
    var forgotPasswordCopy = $("#lpw-text");
    var panel = args.panel;
    // content may have been set on server side. If so, do not hide.
    if (forgotPasswordCopy.length > 1 && forgotPasswordCopy.html().length < 1) {
        forgotPasswordCopy.hide();
    }

    forgotPasswordNote.delegate('a.sign-in-component__fpw-link', "click", function(evt) {
        evt.preventDefault();
        var email = site.signin.getEmailAddress(emailNode);

        if (!email || email.length < 1) {
            if (panel) {
                panel.setMessages({
                    text: site.signin.forgotPasswordNoEmailProvided
                });
            } else {
                generic.showErrors([{
                    text: site.signin.forgotPasswordNoEmailProvided
                    }], errorListNode);
                generic.showErrorState(emailNode[0]);
            }
            return null;
        }

        generic.jsonrpc.fetch({
            method: 'user.emailAvailable',
            params: [{
                "EMAIL_ADDRESS": email
            }],
            onSuccess : function(result) {
                var responseData = result.getValue();
                if (responseData === 0) {
                    forgotPasswordCopy.addClass("hidden");
                    site.signin.requestPassword(email);
                } else {
                    if (panel) {
                        site.checkout.panel.clearPanelMessages();
                        panel.setMessages({
                            text: site.signin.forgotPasswordEmailNotFound
                        }, true);
                        
                    } else {
                        errorListNode[0].innerHTML = '';
                        forgotPasswordCopy.removeClass("hidden");
                        generic.showErrors([{
                            text: site.signin.forgotPasswordEmailNotFound
                            }], errorListNode);
                        generic.showErrorState(emailNode[0]);
                    }
                }
            },
            onFailure : function(result) {
                var errorObjectsArray = result.getMessages();
                var errorKey = errorObjectsArray[0].key;
                if (panel) {
                    panel.setMessages({
                        text: site.signin.forgotPasswordNoEmailProvided
                    });
                } else {
                    generic.showErrors([{
                        text: site.signin.forgotPasswordNoEmailProvided
                        }], errorListNode);
                        generic.showErrorState(emailNode[0]);
                }
            }
        });
        
    });
};


/**
 * This method is used to retrieve a user's password hint.
 * @param {email} the user email that will be passed. **REQUIRED**
 * @param {onSucess}
 * @param {onFailure}
 * @methodOf site.signin
*/
site.signin.getPasswordHint = function(args) {
 if (!args.email) {
     return null;
 }
 var onSuccess = args.onSuccess || function() {};
 var onFailure = args.onFailure || function() {};


 generic.jsonrpc.fetch({
     method: 'user.passwdHint',
     params: [{
         "EMAIL_ADDRESS": args.email
     }],
     onSuccess : onSuccess,
     onFailure : onFailure
 });
};

/**
    * This method is used to reset a users password by submitting a hidden form.
    * @param {email} the user's email address **REQUIRED**
    * @param {actionURL} the page URL of the reset page **REQUIRED**
    * **NOTE**: The error check for if an account exists is handled by the password
    * hint function. The reset is hidden inside the password hint function
    * so no duplicate error checking is needed here.
*/
site.signin.initResetPassword = function(emailNode) {
    //have to initialise the link here because it isn't on the page until the pw hint method is invoked
    var email = site.signin.getEmailAddress(emailNode);
    var resetPassLink = $('#pwd-reset');
    if (resetPassLink) {
        resetPassLink.bind('click', function(evt) {
            evt.preventDefault();
            site.signin.requestPassword(email);
        });
    }
};


/**
    * This method is used to direct the user to registration.tmpl or password_request.tmpl.
    * The passed values are injected into the genric form before it is submitted.
    * @param {email} the user email that will be passed. **REQUIRED**
    * @param {actionURL} action url used on user submit. **REQUIRED**
    * @param {returnURL} passed when an action is needed after the user
    * has gone to the next template page. **NOT REQUIRED**
    * Example case for returnURL is if the user goes through checkout and registers,
    * the returnURL is used to pass the viewbag action url to the registration page. Once
    * registration form is filled out, user will be brought to viewbag.
    * @methodOf site.signin
*/
site.signin.submitHiddenSigninForm = function(args) {
    if (!args.actionURL || !site.signin.hiddenForm) {
        return null;
    }
    site.signin.hiddenForm.attr('action', args.actionURL);
    var hiddenEmailNode = $('#sigin-form-hidden-email');
    hiddenEmailNode.val(args.email);
    if (args.returnURL) {
        var hiddenReturnNode = $('#sigin-form-hidden-return');
        hiddenReturnNode.val(args.returnURL);
    }
    site.signin.hiddenForm.submit();
};


/**
    * This method is used to call site.signin.submitHiddenSigninForm by
    * passing the user's email used in the reset form submit. Otherwise
    * password reset directly via URL
    * @param {String} the user email that will be passed. **REQUIRED**
    * @methodOf site.signin
*/
site.signin.requestPassword = function(emailAddr) {
    var actionPath = '/account/password_request.tmpl';

    // grab and return the first match, the actual HTML Element object, or return undef if not found
    site.signin.hiddenForm    = $('form#signin-hidden-form').get(0);

    if (site.signin.hiddenForm) {
        site.signin.submitHiddenSigninForm({
            email: emailAddr,
            actionURL: actionPath
        });
    } else {
        var resetURL = actionPath + '?PC_EMAIL_ADDRESS=' + encodeURIComponent(emailAddr);
        document.location.href = resetURL;
    }
};

/**
    * This method is used to pull the user's email from either a form
    * input or container html tag wrapper (i.e. div, span, etc)
    * @param {String} emailNode the user email that will be passed. **REQUIRED**
    * @methodOf site.signin
*/
site.signin.getEmailAddress = function(emailNode) {
    if(!emailNode || emailNode.length < 1) {
        return null;
    }
    
    var email = emailNode[0].value || emailNode[0].innerHTML;
    return email;
};
