var constants = require('./constants');

exports.invalidAccessTokenError = function (res) {
    var errorMsg = constants.responseErrors.INVALID_ACCESS;
    sendData(errorMsg, res);
};

exports.parameterMissingError = function (res) {

    var errorMsg = constants.responseErrors.MANDATORY_FIELDS;
    sendData(errorMsg, res);
};

exports.somethingWentWrongError = function (res) {

    var errorMsg = constants.responseErrors.SOMETHING_WRONG;
    sendData(errorMsg, res);
};

exports.somethingWrong = function (res) {

    var errorMsg = constants.responseErrors.SOMETHING_WRONG;
    sendData(errorMsg, res);
};


exports.bookingCancelled = function (res) {

    var errorMsg = constants.responseErrors.BOOKING_CANCELLED;
    sendData(errorMsg, res);
};

exports.sendSuccessData = function (data, res) {

    var successData = {status: "true", data: data};
    sendData(successData, res);
};

exports.sendError = function (error, res) {

    var successData = {status: "false", error: error, "flag": 0};
    sendData(successData, res);
};

exports.successStatusMsg = function (res) {

    var successMsg = {"status": "true"};
    sendData(successMsg, res);
};

exports.noUserFound = function (res)
{
    var successData = {status: "false", "error": "No such user found.", "flag": 7};
    sendData(successData, res);
};

function sendData(data, res) {
    res.type('json');
    res.jsonp(data);
}


exports.sendData = function (data, res) {

    res.type('json');
    res.jsonp(data);
};
