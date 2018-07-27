var md5 = require('MD5');
var async = require('async');
var common = require('./commonFunction');
var sendResponse = require('./sendResponse');
var constants = require('./constants');
var emailer = require('./email_templates');
var dtf = require('./dateTimeFunctions');
var _ = require("lodash");
/*
 * ----------------------------------------------------------------------------------------------------------------------------------------
 * List of Areas
 * INPUT : access_token
 * OUTPUT : error, list
 * ----------------------------------------------------------------------------------------------------------------------------------------
 */

exports.adminLogin = function(req, res) {
    var adminEmail = req.body.user_email;
    var password = req.body.password;

    console.log("API: Admin Login - 2 Mandatory field : user_email, password", req.body);

    var checkBlank = [adminEmail, password];
    async.waterfall([
        function(callback) {
            common.checkBlankWithCallback(res, checkBlank, callback);
        }
    ], function(final) {
        password = md5(password);
        var response = {};
        var sqladminLogin = "SELECT ad.`access_token`, ad.`area_id`, ar.`name` AS `area_name` FROM `admin` ad LEFT JOIN `areas` ar ON ad.`area_id` = ar.`area_id` WHERE ad.`email`=? && ad.`password`=? LIMIT 1";
        connection.query(sqladminLogin, [adminEmail, password], function(err, resultData) {
            if (!err) {
                if (resultData.length == 0) {
                    response = {
                        "error": "Invalid email or password",
                        "flag": 10
                    };
                    res.send(JSON.stringify(response));
                } else {
                    if (resultData[0].area_id == 0) {
                        resultData[0].area_name = 'ALL';
                    }
                    response = {
                        "log": "Logged in successfully.",
                        "access_token": resultData[0].access_token,
                        "area_id": resultData[0].area_id,
                        "area_name": resultData[0].area_name
                    };
                    res.send(JSON.stringify(response));
                }
            } else {
                sendResponse.somethingWentWrongError(res);
            }
        });
    });
};

exports.forgotPassword = function(req, res) {
    var email = req.body.email;
    var checkBlank = [email];
    async.waterfall([
        function(callback) {
            common.checkBlankWithCallback(res, checkBlank, callback);
        }
    ], function(err1, callback) {
        if (!err1) {
            var sql = "SELECT * FROM `admin` WHERE `email`=? LIMIT 1";
            connection.query(sql, [email], function(err2, adminData) {
                if (!err2) {
                    if (adminData.length > 0) {

                        console.log(adminData[0].email);
                        var token = adminData[0]['email'] + new Date();
                        token = md5(token);
                        var reset_pass_url = "http://liveadmin.blowLTDmobile.com/blowLTD/admin-reset-password/index.html?token=" + token;
                        emailer.forgotPasswordRequest(adminData[0].email, reset_pass_url, adminData[0].admin_name);
                        var sql2 = "UPDATE `admin` SET `reset_password_token`=? WHERE `admin_id`=? LIMIT 1";
                        connection.query(sql2, [token, adminData[0].admin_id], function(err3, queryResult) {
                            if (!err3) {
                                var message = {
                                    "log": "Reset password link has been sent to your email."
                                };
                                res.send(JSON.stringify(message));
                            } else {
                                sendResponse.somethingWentWrongError(res);
                            }
                        });
                    } else {
                        sendResponse.somethingWentWrongError(res);
                    }
                } else {
                    sendResponse.somethingWentWrongError(res);
                }
            });
        } else {
            sendResponse.somethingWentWrongError(res);
        }
    });
};

exports.resetPassword = function(req, res) {

    var new_pass = req.body.new_password;
    var token = req.body.reset_token;
    var checkBlank = [new_pass, token];
    async.waterfall([
        function(callback) {
            common.checkBlankWithCallback(res, checkBlank, callback);
        }
    ], function(err1, callback) {
        if (!err1) {
            var sql = "SELECT `admin_id` FROM `admin` WHERE `reset_password_token`=? LIMIT 1";
            connection.query(sql, [token], function(err2, resultData) {
                if (!err2) {
                    if (resultData.length > 0) {
                        var sql2 = "UPDATE `admin` SET `password`=?, `reset_password_token`=? WHERE `admin_id`=? LIMIT 1";
                        new_pass = md5(new_pass);
                        connection.query(sql2, [new_pass, "", resultData[0].admin_id], function(err3, queryResult) {
                            if (!err3) {
                                var message = {
                                    "log": "Password reset successfuly."
                                };
                                res.send(JSON.stringify(message));
                            } else {
                                sendResponse.somethingWentWrongError(res);
                            }
                        });
                    } else {
                        var message = {
                            "error": "Invalid reset token."
                        };
                        res.send(JSON.stringify(message));
                    }
                } else {
                    sendResponse.somethingWentWrongError(res);
                }
            });
        } else {
            sendResponse.somethingWentWrongError(res);
        }
    });
};

exports.changePassword = function(req, res) {

    var accessToken = req.body.access_token;
    var oldPass = req.body.old_password;
    var newPass = req.body.new_password;
    var checkBlank = [accessToken, oldPass, newPass];
    async.waterfall([
        function(callback) {
            common.checkBlankWithCallback(res, checkBlank, callback);
        },
        function(callback) {
            common.checkAuthToken(accessToken, res, callback);
        }
    ], function(err1, adminInfo) {

        if (!err1) {
            newPass = md5(newPass);
            oldPass = md5(oldPass);
            if (oldPass == adminInfo[0].password) {

                var sql = "UPDATE `admin` SET `password`=? WHERE `admin_id`=?";
                connection.query(sql, [newPass, adminInfo[0].admin_id], function(err2, resultData) {

                    if (!err2) {
                        var message = {
                            "log": "Password changed successfully."
                        };
                        res.send(JSON.stringify(message));
                    } else {
                        sendResponse.somethingWentWrongError(res);
                    }
                });
            } else {
                var message = {
                    "error": "Old password doesn't match."
                };
                res.send(JSON.stringify(message));
            }
        } else {
            sendResponse.somethingWentWrongError(res);
        }
    });
};
