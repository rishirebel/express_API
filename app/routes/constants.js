function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        enumerable: true,
        writable: false,
        configurable: false
    });
}
exports.responseErrors = {};

define(exports.responseErrors, "EMAIL_NOT_EXISTS", "This email address is not associated with any account.");
define(exports.responseErrors, "FB_UNAUTHORIZATION", 'Not an authenticated user.');
define(exports.responseErrors, "ACCOUNT_BLOCKED", "Sorry there seems to be a problem with your account, please contact our customer service team.");
define(exports.responseErrors, "ACCOUNT_DELETED", "Sorry there seems to be a problem with your account, please contact our customer service team.");
define(exports.responseErrors, "WRONG_EMAIL_PASSWORD", "Oops! The email or password is incorrect.");
define(exports.responseErrors, "EMAIL_ALREADY_REGISTERED", 'This email is already registered!');
define(exports.responseErrors, "EMAIL_ALREADY_IN_USE", 'Email already in use.');
define(exports.responseErrors, "MANDATORY_FIELDS", {
    "error": 'There seems to be a missing field, please check and try again.',
    status: "false",
    "flag": 0
});
define(exports.responseErrors, "INVALID_ACCESS", {
    "error": 'Sorry, invalid login. Please try again.',
    status: "false",
    "flag": 1
});
define(exports.responseErrors, "SOMETHING_WRONG", {
    "error": 'Oops, something went wrong, please try again!',
    status: "false",
    "flag": 0
});

exports.userRequestFrom = {};
define(exports.userRequestFrom, "EMAIL", 1);
define(exports.userRequestFrom, "FACEBOOK", 2);
define(exports.userRequestFrom, "BOTH", 3);

exports.userDeviceType = {};
define(exports.userDeviceType, "ANDROID", 1);
define(exports.userDeviceType, "IOS", 2);

exports.isBlocked = {};
define(exports.isBlocked, "NON_BLOCKED", 0);
define(exports.isBlocked, "BLOCKED", 1);
define(exports.isBlocked, "DELETED", 2);

exports.generalMessages = {};
define(exports.generalMessages, "POPUP_MESSAGE", 'Update the app with new version.');
define(exports.generalMessages, "DEFAULT_LOGO", "logo.jpeg");

exports.statusFlags = {};
define(exports.statusFlags, "SUCCESS", 100);
