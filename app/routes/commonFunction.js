var sendResponse = require('./sendResponse');
var async = require('async');
var AWSSettings = require('../config/ApplicationSettings').getAWSSettings();
var genVarSettings = require('../config/ApplicationSettings').generalVariableSettings();
var emailSettings = require('../config/ApplicationSettings').emailSettings();
var emailer = require('./email_templates');
var constants = require('./constants');


exports.sendEmail = function(receiverMailId, message, subject, callback) {
    var nodemailer = require("nodemailer");
    var options = {
        host: 'smtp.mandrillapp.com',
        port: 587,
        auth: {
            user: "stacey@blowltd.com",
            pass: emailSettings.mandrillPassword
        }
    };
    var transporter = nodemailer.createTransport(options);
    var mailOptions = {
        from: "blowLTD <" + emailSettings.mainEmail + ">", // sender address
        to: receiverMailId, // list of receivers
        subject: subject, // Subject line
        html: message // plaintext body
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            return callback(0);
        } else {
            console.log('Message sent: ' + info.response);
            return callback(1);
        }

    });
};

exports.checkBlank = function (arr) {

    return (checkBlank(arr));
};

function checkBlank(arr) {
    var arrlength = arr.length;
    for (var i = 0; i < arrlength; i++) {
        if (arr[i] == '') {
            return 1;
            break;
        }
        else if (arr[i] == undefined) {
            return 1;
            break;
        }
        else if (arr[i] == '(null)') {
            return 1;
            break;
        }
    }
    return 0;
}

exports.checkBlankWithCallback = function (res, blankData, callback) {

    var checkBlankData = checkBlank(blankData);

    if (checkBlankData) {
        console.log("parameterMissingError", blankData);
        sendResponse.parameterMissingError(res);
    }
    else {
        callback(null);
    }
};


exports.checkAuthToken = function (token, res, callback) {
    var sql = "SELECT * FROM `admin` WHERE `access_token`=? LIMIT 1";
    connection.query(sql, [token], function (err, resultData) {
        if (!err) {
            if (resultData.length == 0) {
                sendResponse.invalidAccessTokenError(res);
            }
            else {
                return callback(null, resultData);
            }
        }
        else {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
    });
};


/*
 * -----------------------------------------------------------------------------
 * Uploading image to s3 bucket
 * INPUT : file parameter
 * OUTPUT : image path
 * -----------------------------------------------------------------------------
 */
function uploadImageToS3Bucket(file, folder, res, callback) {

    var fs = require('fs');
//    var mathjs = require('mathjs');
//    var math = mathjs();
    var AWS = require('aws-sdk');

    if (file == undefined) {
        return callback("logo.jpeg");
    }
    else {
        var filename = file.name; // actual filename of file
        var path = file.path; //will be put into a temp directory
        var mimeType = file.type;

        fs.readFile(path, function (error, file_buffer) {

            if (error) {
                //  console.log(error)
                return callback("logo.jpeg");
            }
            else {
                var length = 5;
                var str = '';
                var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                var size = chars.length;
                for (var i = 0; i < length; i++) {

                    var randomnumber = Math.floor(Math.random() * size);
                    str = chars[randomnumber] + str;
                }

                filename = "blowltd-" + str + "-" + file.name;
                filename = filename.split(' ').join('-');

                AWS.config.update({accessKeyId: AWSSettings.awsAccessKey, secretAccessKey: AWSSettings.awsSecretKey});
                var s3bucket = new AWS.S3();
                var params = {Bucket: AWSSettings.awsBucket, Key: folder + '/' + filename, Body: file_buffer, ACL: 'public-read', ContentType: mimeType};

                s3bucket.putObject(params, function (err, data) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        return callback(filename);
                    }
                });
            }
        });
    }
}

exports.getImageNameAfterUpload = function (file, folder, res, callback) {

    if ((file) && (file.name)) {
        uploadImageToS3Bucket(file, folder, res, function (fileName) {
            return callback(fileName);
        });
    }
    else {
        sendResponse.parameterMissingError(res);
    }
};

exports.GetSkillsOfTech = function (techType, callback) {
    var sql = "SELECT `skill_id`, `skill_name` FROM `skills` WHERE `skill_id` IN ("+techType+")";
        connection.query(sql, [], function (err, result) {

        callback(result);

    });
};

/*
 * -----------------------------------------------------------------------------
 * Insert areas of tech
 * INPUT : techId, area_ids
 * OUTPUT : cities inserted in table
 * -----------------------------------------------------------------------------
 */
exports.insertAreas = function(techId, area_ids) {
    area_ids = area_ids.split(',');
    var numberOfAreas = area_ids.length;
    var areas = [];
    async.forEach(area_ids, function (item, callback1) {
        var sql = "SELECT `name` FROM `areas` WHERE `area_id`=? LIMIT 1";
        connection.query(sql, [item], function (err, result) {
            if (err)
            {
                console.log(err);
            } else
            {
                areas.push(techId, item, result[0].name);
            }
            callback1();
        });
    }, function (err)
    {
        if (err)
        {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            var string1 = "(?,?,?),";
            var insert = string1.repeat(numberOfAreas - 1);
            insert = insert + "(?,?,?)";

            var sql = "INSERT INTO `tech_cities`(`technician_id`, `area_id`, `area_name`) VALUES " + insert + "";
            connection.query(sql, areas, function(err, resultCities) {
                return;
            });

        }
    });
};

/*
 * -----------------------------------------------------------------------------
 * prototype for repeating a string
 * INPUT : string and no. of times the string has to be repeated
 * OUTPUT : repeated string
 * -----------------------------------------------------------------------------
 */
String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
};

exports.formatDate = function (date) {
    var today = new Date(date);
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var new_date = yyyy + '-' + mm + '-' + dd;
    return new_date;

};

exports.getDatemmddyy = function (date) {
    var date = new Date(date);
    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year;

};

/*
 * --------------------------------------------------------------------
 * get service names from service ids
 * Input:array containing service ids
 * Output: array containing service names
 * --------------------------------------------------------------------
 */
exports.getServiceNames = function (services, res, callback) {

    var treatments = [];

    async.forEach(services, function (item, callback1) {

        var sql = "SELECT `name` FROM `service` WHERE `service_id`=?";
        connection.query(sql, [item], function (err, responseService) {
            if (err) {
                console.log(err);
            } else {
                treatments.push(responseService[0].name);
            }
            callback1();

        });

    }, function (err) {
        if (err) {
            console.log(err);
            response.somethingWrong(res);
        } else {

            return callback(treatments);

        }
    });

};

/*
 * -----------------------------------------------------------------------------
 * Sending push notification to devices
 * INPUT : iosDeviceToken,message
 * OUTPUT : Notification send
 * -----------------------------------------------------------------------------
 */
function sendApplePushNotification (iosDeviceToken, message, pushFlag, bookingId) {
  var apn = require('apn');
  var deviceCount = iosDeviceToken.length;
  if (deviceCount != 0)
  {
      console.log("Apple push Notifications for Booking ID: ", bookingId);
      var options = {
          cert: genVarSettings.pemFileArtist,
          certData: null,
          key: genVarSettings.pemFileArtist,
          keyData: null,
          passphrase: 'click',
          ca: null,
          pfx: null,
          pfxData: null,
          gateway: genVarSettings.iosGateway,
          port: 2195,
          rejectUnauthorized: true,
          enhanced: true,
          cacheLength: 100,
          autoAdjustCache: true,
          connectionTimeout: 0,
          ssl: true
      };
      var apnConnection = new apn.Connection(options);

      async.forEach(iosDeviceToken, function (token, callback1)
      {
          if (token != '' && token != 0)
          {

              var deviceToken1 = token.replace(/[^0-9a-f]/gi, "");
              if ((deviceToken1.length) % 2)
              {
                  console.log("Error in Device token ", token);
              }
              else
              {
                try {
                  console.log("try ", token);
                  var myDevice = new apn.Device(token);
                  var note = new apn.Notification();

                  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                  note.badge = 0;
                  note.sound = 'ping.aiff';
                  note.alert = message;
                  note.payload = {"flag": pushFlag, "booking_id": bookingId};
                  apnConnection.pushNotification(note, myDevice);
                }
                catch (ex)
                {
                  console.log("ex ", ex);
                  console.log("Error in Device token ", token);
                }
            }
        }
        else
        {
            console.log("Error in Device token ", token);
        }
        callback1();
      }, function (err) {
          if (err) {
              console.log("there was Some error in the APPLE push notification",err,message);

          }
          else
          {
              console.log("Apple push Notification sent to all devices for Booking ID: ", bookingId, message);
          }
      });
  }
  else
  {
      console.log("No apple push Notifications for Booking ID: ", bookingId, message);
  }

};


exports.sendApplePushNotification = sendApplePushNotification;


sendApplePushNotificationToCustomer = function (iosDeviceToken, message, pushFlag, bookingId) {
  var apn = require('apn');
  var deviceCount = iosDeviceToken.length;
  if (deviceCount != 0)
  {
      console.log("Apple push Notifications for Booking ID: ", bookingId);
      var options = {
          cert: genVarSettings.pemFileCustomer,
          certData: null,
          key: genVarSettings.pemFileCustomer,
          keyData: null,
          passphrase: 'click',
          ca: null,
          pfx: null,
          pfxData: null,
          gateway: genVarSettings.iosGateway,
          port: 2195,
          rejectUnauthorized: true,
          enhanced: true,
          cacheLength: 100,
          autoAdjustCache: true,
          connectionTimeout: 0,
          ssl: true
      };
      var apnConnection = new apn.Connection(options);

      async.forEach(iosDeviceToken, function (token, callback1)
      {
          if (token != '' && token != 0)
          {

              var deviceToken1 = token.replace(/[^0-9a-f]/gi, "");
              if ((deviceToken1.length) % 2)
              {
                  console.log("Error in Device token ", token);
              }
              else
              {
                try {
                  var myDevice = new apn.Device(token);
                  var note = new apn.Notification();

                  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                  note.badge = 0;
                  note.sound = 'ping.aiff';
                  note.alert = message;
                  note.payload = {"flag": pushFlag, "booking_id": bookingId};
                  apnConnection.pushNotification(note, myDevice);
                }
                catch (ex)
                {
                  console.log("ex ", ex);
                  console.log("Error in Device token ", token);
                }
            }
        }
        else
        {
            console.log("Error in Device token ", token);
        }
        callback1();
      }, function (err) {
          if (err) {
              console.log("There was some error in the apple push notification",err, message);

          }
          else
          {
              console.log("Apple push Notification sent to all devices for Booking ID: ", bookingId, message);
          }
      });
  }
  else
  {
      console.log("No apple push Notifications for Booking ID: ", bookingId, message);
  }
};
exports.sendApplePushNotificationToCustomer = sendApplePushNotificationToCustomer;

sendAndroidPushNotification = function (resulTokens, text, flag, bookingId) {
    var gcm = require('node-gcm');

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        data: {
            message: text,
            flag: flag,
            booking_id: bookingId
        }
    });
    var sender = new gcm.Sender('AIzaSyDlEDoWUJmTorQjDbI8uA5FrKp6pkSLuEs');
    var registrationIds = resulTokens;
    //registrationIds.push(resulTokens)
    console.log(message);
    sender.sendNoRetry(message, registrationIds, function (err, result) {
      if(err){
          console.log("there was some error in the android push notification",err);
      }

        console.log("Android push notification was sent successfully",result, text);
    });
};

exports.sendAndroidPushNotification = sendAndroidPushNotification;


sendAndroidPushNotificationToCustomer = function (resulTokens, text, flag, bookingId) {
    var gcm = require('node-gcm');
    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        data: {
            message: text,
            flag: flag,
            booking_id: bookingId
        }
    });
    var sender = new gcm.Sender('AIzaSyDnnRLG7f9A40rD1F9OivOF6MtK-UbW2DE');
    var registrationIds = resulTokens;
    console.log(message);
    sender.sendNoRetry(message, registrationIds, function (err, result) {
      if(err){
          console.log("there was some error in the android push notification",err);
      }

        console.log("Android push notification was sent successfully",result, text);
    });
};

exports.sendAndroidPushNotificationToCustomer = sendAndroidPushNotificationToCustomer;


cancelBookingRefund = function (booking, res) {
    var sql = "SELECT u.`email`, CONCAT(u.`first_name`,' ',u.`last_name`) AS `user_name`, t.`device_type` AS tech_device_type, t.`device_token` AS tech_device_token,u.`device_type` AS cust_device_type,u.`device_token` AS cust_device_token FROM `technicians` t, `users` u WHERE (t.`technician_id` = ? && u.`user_id` = ?) LIMIT 1";
    connection.query(sql, [booking.technician_id, booking.user_id], function (err3, resultData) {
        console.log(resultData);
        if (!err3)
        {
            console.log("Stripe REfund");
            if (booking.transaction_created_at != '0000-00-00 00:00:00')
            {
                var transid = booking.transaction_id;
                console.log("Booking transid" + booking.transaction_id);
                var stripe = require('stripe')(genVarSettings.stripeToken);
                stripe.refunds.create({
                    charge : transid
                },function (err, refund)
                {
                    if (err)
                    {
                        console.log(err);
                        var status = "false";
                        var source = "Admin Cancel";
                        var amount = parseFloat(booking.service_price) - parseFloat(booking.creditsUsed);
                        amount = parseFloat(amount).toFixed(2);
                        var sql = "INSERT INTO `transactions`(`booking_id`, `transaction_id`,`user_id`, `amount`, `status`, `source`) VALUES (?,?,?,?,?,?) ";
                        connection.query(sql, [booking.booking_id, transid, booking.user_id, amount, status, source], function(err, resultBookingRequest) {

                        });

                    }
                    else
                    {
                        var status = "true";
                        var source = "Admin Cancel";
                        var amount = refund.amount/100;
                        amount = parseFloat(amount).toFixed(2);
                        var sql = "INSERT INTO `transactions`(`booking_id`, `transaction_id`,`user_id`, `amount`, `status`, `source`) VALUES (?,?,?,?,?,?) ";
                        connection.query(sql, [booking.booking_id, transid, booking.user_id, amount, status, source], function(err, resultBookingRequest) {

                        });
                        console.log("=====================Stripe Refund Successfull======================");
                    }
                });
            }
            else
            {
                var transid = booking.transaction_id;
                console.log("Booking transid" + booking.transaction_id);
                var stripe = require('stripe')(genVarSettings.stripeToken);
                stripe.refunds.create({
                    charge : transid
                },function (err, refund)
                {
                    if (err)
                    {
                        console.log(err);
                        var status = "false";
                        var source = "Admin Cancel";
                        var amount = parseFloat(booking.service_price) - parseFloat(booking.creditsUsed);
                        amount = parseFloat(amount).toFixed(2);
                        var sql = "INSERT INTO `transactions`(`booking_id`, `transaction_id`,`user_id`, `amount`, `status`, `source`) VALUES (?,?,?,?,?,?) ";
                        connection.query(sql, [booking.booking_id, transid, booking.user_id, amount, status, source], function(err, resultBookingRequest) {

                        });

                    }
                    else
                    {
                        var status = "true";
                        var source = "Admin Cancel";
                        var amount = refund.amount/100;
                        amount = parseFloat(amount).toFixed(2);
                        var sql = "INSERT INTO `transactions`(`booking_id`, `transaction_id`,`user_id`, `amount`, `status`, `source`) VALUES (?,?,?,?,?,?) ";
                        connection.query(sql, [booking.booking_id, transid, booking.user_id, amount, status, source], function(err, resultBookingRequest) {

                        });
                        console.log("=====================Stripe Refund Successfull======================");
                    }
                });
                console.log("Error");
            }

            var message = "We've cancelled your appointment scheduled for " + getFormatedDatetime(booking.local_start_time)+ ", please contact us.";
            var androidDevicesTech = [];
            var iosDevicesTech = [];
            if (resultData[0].tech_device_token != '' || resultData[0].tech_device_token != 0) {
                if (resultData[0].tech_device_type == 1) {
                  androidDevicesTech.push(resultData[0].tech_device_token);
                    sendAndroidPushNotification(androidDevicesTech, message, 2, booking.id);
                }
                else {
                  iosDevicesTech.push(resultData[0].tech_device_token);
                    sendApplePushNotification(iosDevicesTech, message, 2, booking.id);
                }
            }
            var androidDevices = [];
            var iosDevices = [];
            if (resultData[0].cust_device_token != '' || resultData[0].cust_device_token != 0)
            {
                if (resultData[0].cust_device_type == 1) {
                    androidDevices.push(resultData[0].cust_device_token);
                    sendAndroidPushNotificationToCustomer(androidDevices, message, 7, booking.id);
                }
                else {
                  iosDevices.push(resultData[0].cust_device_token);
                    sendApplePushNotificationToCustomer(iosDevices, message, 5, booking.id);
                }
            }
            // var message1 = {"log": "Booking cancelled successfully."};
            // res.send(JSON.stringify(message1));
            emailer.sendEmailReceiptToUser(resultData[0].email, resultData[0].user_name, booking.creditsUsed, booking.service_price, booking.service_name, booking.local_start_time);
        }
        else {
            sendResponse.somethingWentWrongError(res);
        }
    });

};

exports.cancelBookingRefund = cancelBookingRefund;

cancelBookingRefundOfBooked = function (booking, res) {


    var sql = "SELECT u.`email`, CONCAT(u.`first_name`,' ',u.`last_name`) AS `user_name`, u.`device_type` AS cust_device_type, u.`device_token` AS cust_device_token FROM `users` u WHERE u.`user_id` = ?";
    connection.query(sql, [booking.user_id], function (err3, resultData) {

        console.log(resultData);

        if (!err3)
        {
            var amount = booking.service_price - booking.creditsUsed;
            console.log("no refund required");
            console.log("Admin Cancelled Refund");
            console.log(resultData[0]);
            var message = "We've cancelled your appointment scheduled for " + getFormatedDatetime(booking.local_start_time)+ ", please contact us.";
            //emailer.sendEmailReceiptToUserBooked(resultData[0].email, resultData[0].user_name, booking.creditsUsed, booking.service_price, booking.service_name, booking.local_start_time);
            var androidDevices = [];
            var iosDevices = [];
            if (resultData[0].cust_device_token != '' || resultData[0].cust_device_token != 0)
            {
                if (resultData[0].cust_device_type == 1) {
                    androidDevices.push(resultData[0].cust_device_token);
                    sendAndroidPushNotificationToCustomer(androidDevices, message, 7, booking.id);
                }
                else {
                  iosDevices.push(resultData[0].cust_device_token);
                    sendApplePushNotificationToCustomer(iosDevices, message, 5, booking.id);
                }
            }
            else
            {
            console.log("Ye hua!!");
            }

        }
        else {
            sendResponse.somethingWentWrongError(res);
        }
    });

};

exports.cancelBookingRefundOfBooked = cancelBookingRefundOfBooked;



/*
 * -----------------------------------------------------------------------------
 * get datetime in (yyyy-mm-dd hh:mm pm/am) format
 * INPUT : date
 * OUTPUT : changed format datetime sent
 * -----------------------------------------------------------------------------
 */
function getFormatedDatetime (date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    //month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    //day = (day < 10 ? "0" : "") + day;


    var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var datesArr = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'
        ,'19','20','21','22','23','24','25','26','27','28','29','30','31'];

    //month = intval(month);
    //day = intval(day);

    month = monthsArr[month-1];
    day = datesArr[day-1];

    return month + " " + day + ", " +year+ " at " + hours + ":" + minutes+ ' ' + ampm;


}

function gethhmm (date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ":" + minutes;
}

exports.getFormatedtime = function (date) {
    date = new Date(date);
    var hours = date.getHours();

    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    console.log("Hours is "+ hours);
    console.log("minutes is "+ minutes)

    return hours + ":" + minutes+ ' ' + ampm;
};

exports.getFormatedDateddmmyyyy = function (date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    //month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    //day = (day < 10 ? "0" : "") + day;


    var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var datesArr = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'
    ,'19','20','21','22','23','24','25','26','27','28','29','30','31'];

    //month = intval(month);
    //day = intval(day);

    //month = monthsArr[month-1];
    day = datesArr[day-1];

    return day + "/" + month + "/" +year;


};

/*
 * -----------------------------------------------------------------------------
 * Encryption code
 * INPUT : string
 * OUTPUT : crypted string
 * -----------------------------------------------------------------------------
 */
exports.encrypt = function (text) {

    var crypto = require('crypto');
    var cipher = crypto.createCipher('aes-256-cbc', 'd6F3Efeq');
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

/*
 * -----------------------------------------------------------------------------
 * Generate invitation code
 * INPUT : first name
 * OUTPUT : invitation code generated
 * -----------------------------------------------------------------------------
 */
exports.generateInvitationCode = function (fName) {
    var math = require('math');
    var text = fName.slice(0, 4);
    var possible = "0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(math.floor(math.random() * possible.length));
    return text;
};

/*
 * ------------------------------------------------------
 *  Get Number Of Cards For The User
 *  INPUT : userID
 *  OUTPUT : number of cards
 * ------------------------------------------------------
 */

exports.GetNumberOfCardsForTheUser = function (userID, callback) {

    var sql = "SELECT `card_id` FROM `card` WHERE `user_id`=?";
    connection.query(sql, [userID], function (err, cardsResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {

            callback(null, userID, cardsResponse.length);
        }
    });
};


exports.getDateTime = function (date, flag) {
    var date = new Date(date);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    if (flag == 0) {
        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    }
    else {
        return year + "-" + month + "-" + day + " " + hour + ":" + min;
    }

};
/*
 * -----------------------------------------------------------------------------
 * Insert cities of tech
 * INPUT : techId, city
 * OUTPUT : cities inserted in table
 * -----------------------------------------------------------------------------
 */
exports.insertCities = function(techId,city) {
    city = city.split(',');
    var citiesLength = city.length;
    var cities = [];
    for(var i=0; i<citiesLength; i++){
        city[i] = city[i].trim();
        cities.push(techId,city[i]);
    }
    var string1 = "(?,?),";
    var insert = string1.repeat(citiesLength - 1);
    insert = insert + "(?,?)";

    var sql = "INSERT INTO `tech_cities`(`technician_id`, `city_name`) VALUES " + insert + "";
    connection.query(sql, cities, function(err, resultCities) {
        return;
    });
};

/*
 * -----------------------------------------------------------------------------
 * prototype for repeating a string
 * INPUT : string and no. of times the string has to be repeated
 * OUTPUT : repeated string
 * -----------------------------------------------------------------------------
 */
String.prototype.repeat = function (num) {
    return new Array(num + 1).join(this);
};

/*
 * -----------------------------------------------------------------------------
 * get datetime in (yyyy-mm-dd hh:mm pm/am) format
 * INPUT : date
 * OUTPUT : changed format datetime sent
 * -----------------------------------------------------------------------------
 */
exports.getFormatedDatetime = function (date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    //month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    //day = (day < 10 ? "0" : "") + day;


    var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var datesArr = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'
        ,'19','20','21','22','23','24','25','26','27','28','29','30','31'];

    //month = intval(month);
    //day = intval(day);

    month = monthsArr[month-1];
    day = datesArr[day-1];

    return month + " " + day + ", " +year+ " at " + hours + ":" + minutes+ ' ' + ampm;
};



function getAdminEmail () {
    var sql = "SELECT `email` FROM `admin` LIMIT 1";
    connection.query(sql, function (err, response) {
        return response[0].email;
    });
};

/*
 * -----------------------------------------------------------------------------
 * return time difference of cur date and another time
 * INPUT : time
 * OUTPUT : diff of 2 times
 * -----------------------------------------------------------------------------
 */
exports.getDaysDifference = function (time, flag) {
    //var Math = require('mathjs');
    var today = new Date();
    if (flag == 1) {
        var diffMs = (time - today); // milliseconds between now & post date
    }
    else {
        var diffMs = (today - time); // milliseconds between now & post date
    }
    var diffDays = Math.floor(diffMs / 86400000); // days
//    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
//    var diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000); // minutes
//    var diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000)/1000); // seconds
//    var postTime = {"days": diffDays, "hours": diffHrs, "minutes": diffMins,"seconds":diffSecs};

    return diffDays;

};

exports.generatePassword = function () {

    var length = 8;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#&^%?";
    var size = chars.length;
    var str = '';
    for (var i = 0; i < length; i++) {
        var randomnumber = Math.floor(Math.random() * size);
        str = chars[randomnumber] + str;
    }

    return str;
};

exports.getUserIdFromEmail = function (email, res, callback) {

    var sql = "SELECT `user_id` FROM `users` WHERE `email`=?";
    connection.query(sql, [email], function (err, userIdResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else if (userIdResponse.length == 0) {
            var error = {"log": "Email does not exist."};
            res.send(JSON.stringify(error));
        } else {
            callback(null, userIdResponse[0].user_id);
        }
    });
};

exports.getTechIdFromEmail = function (email, res) {

    var sql = "SELECT `technician_id` FROM `technicians` WHERE `email`=? AND `driver_verified` = 1 LIMIT 1";
    connection.query(sql, [email], function (err, techIdResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else if (techIdResponse.length == 0) {
            var error = {"log": "Email has not been registered"};
            res.send(JSON.stringify(error));
        } else {
            var data = { "success": true, "tech_id": techIdResponse[0].technician_id, "log": "Email exists." };
            res.send(JSON.stringify(data));
        }
    });
};

exports.addStripeAccountToTechnician = function (req, res) {

    var email = req.body.email;
    var stripe_key = req.body.stripe_key;
    var tech_id = req.body.tech_id;

    var sql = "UPDATE `technicians` SET `stripe_key`=? WHERE `email`=? LIMIT 1";
    connection.query(sql, [stripe_key, email], function (err, stripeResponse) {

        if (err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            var error = {"log": "Stripe has been integrated successfully."};
            res.send(JSON.stringify(error));
        }
    });
};



ratingCalculation = function(rating) {
    var actual_rat = parseFloat(rating);
    if(actual_rat == 0.0) {
        return actual_rat;
    }
    else {
        var new_rating = parseFloat(Math.floor(rating));
        var plus_rat = new_rating + 0.5;
        if(new_rating >= plus_rat) {
            return parseFloat(Math.ceil(new_rating));
        }
        else {
            return plus_rat;
        }
    }
};

exports.ratingCalculation = ratingCalculation;




exports.checkBookingTime =function (res, bookingDate, offset, callback) {
    var bookingDate = new Date(bookingDate);
    console.log(bookingDate);
    var checkOffsetFrom = new Date("October 25, 2015 00:00:00").getTime();
    var checkOffsetTo = new Date("March 27, 2016 00:00:00").getTime();
    var bookingdateintime = new Date(bookingDate).getTime();
    if (bookingdateintime > checkOffsetFrom && bookingdateintime < checkOffsetTo)
    {
        offset = 0;

    }
    else
    {
        if (offset == 0)
        {
            offset = 60;
        }

    }
    offset = parseInt(offset);
    console.log("Final offset", offset);
    var todaydate = new Date();
    var bookingDateddmmyyy = dateWithSlashes(bookingDate);
    var todaydateddmmyy = dateWithSlashes(todaydate);
    console.log("todaydateddmmyy" + todaydateddmmyy);
    console.log("bookingDateddmmyyy" + bookingDateddmmyyy);
    var timeDiff = Math.abs(new Date(bookingDateddmmyyy).getTime() - new Date(todaydateddmmyy).getTime());
    console.log("timeDiff" , timeDiff);
    //var timeDiff = Math.abs(bookingDate.getTime() - todaydate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    var localBookingDate = bookingDate.setMinutes(bookingDate.getMinutes() + (offset - 0));
    localBookingDate = new Date(localBookingDate);
    console.log(localBookingDate);
    console.log("Local Hours" + localBookingDate.getHours());
    console.log("Local Minutes" + localBookingDate.getMinutes());
    if (diffDays > 29)
    {
        var error = "Sorry. You cannot make booking for more than 28 days in advance";
        sendResponse.sendError(error, res);
    }
    else if (bookingDate == '0000-00-00 00:00:00' || bookingDate.getTime() == 0 || bookingDate == 'January 01, 1970 00:00:00' || bookingDate.getTime() < 1445625000000 ){

        var error = "Sorry. Something went wrong. Please try again.";
        sendResponse.sendError(error, res);

    }
    else{
        if (localBookingDate.getHours() >= 21) {
            var error = "Sorry. We only accept bookings between 7am to 8pm.";
            sendResponse.sendError(error, res);
        } else if (localBookingDate.getHours() == 20) {
            if (localBookingDate.getMinutes() > 29) {
                var error = "Sorry. We only accept bookings between 7am to 8pm.";
                sendResponse.sendError(error, res);
            } else {
                callback(null);
            }
        } else if (localBookingDate.getHours() == 7) {
            if (localBookingDate.getMinutes() < 0) {
                var error = "Sorry. We only accept bookings between 7am to 8pm.";
                sendResponse.sendError(error, res);
            } else {
                callback(null);
            }
        } else if (localBookingDate.getHours() < 7) {
            var error = "Sorry. We only accept bookings between 7am to 8pm.";
            sendResponse.sendError(error, res);
        } else {
            callback(null);
        }
    }
};

exports.checkIfBookingExists =function (res, booking_id, callback) {
    var sql = "SELECT `technician_id`, `start_time` FROM `booking_timings` WHERE `booking_id`= ? && `status` IN (0,1,6) LIMIT 1";
    connection.query(sql, [bookingId], function (err, resultBooking) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else if (resultBooking.length == 0){
            var error = "You cannot edit this booking. It's either cancelled or ended or already started.";
            sendResponse.sendError(error, res);
        }
        else {
            return callback(null);

        }
    });
};

cancelBooking = function (booking, res) {
    var sql = "SELECT u.`email`, CONCAT(u.`first_name`,' ',u.`last_name`) AS `user_name`, t.`device_type` AS tech_device_type, t.`device_token` AS tech_device_token,u.`device_type` AS cust_device_type,u.`device_token` AS cust_device_token FROM `technicians` t, `users` u WHERE (t.`technician_id` = ? && u.`user_id` = ?) LIMIT 1";
    connection.query(sql, [booking.technician_id, booking.user_id], function (err3, resultData) {
        console.log(resultData);
        if (!err3)
        {
            var message = "We've cancelled your appointment scheduled for " + getFormatedDatetime(booking.local_start_time) + ", please contact us.";
            if (resultData[0].tech_device_token != '' || resultData[0].tech_device_token != 0) {
                if (resultData[0].tech_device_type == 1) {
                    sendAndroidPushNotification(resultData[0].tech_device_token, message, 2, booking.id);
                }
                else {
                    sendApplePushNotification(resultData[0].tech_device_token, message, 2, booking.id);
                }
            }
            if (resultData[0].cust_device_token != '' || resultData[0].cust_device_token != 0) {
                if (resultData[0].cust_device_type == 1) {
                    sendAndroidPushNotificationToCustomer(resultData[0].cust_device_token, message, 7, booking.id);
                }
                else {
                    sendApplePushNotificationToCustomer(resultData[0].cust_device_token, message, 5, booking.id);
                }
            }
        }
        else {
            sendResponse.somethingWentWrongError(res);
        }
    });

};

exports.cancelBooking = cancelBooking;

cancelBookingOfBooked = function (booking, res) {


    var sql = "SELECT u.`email`, CONCAT(u.`first_name`,' ',u.`last_name`) AS `user_name`, u.`device_type` AS cust_device_type, u.`device_token` AS cust_device_token FROM `users` u WHERE u.`user_id` = ?";
    connection.query(sql, [booking.user_id], function (err3, resultData) {

        console.log(resultData);

        if (!err3)
        {
            var amount = booking.service_price - booking.creditsUsed;
            console.log("no refund required");
            console.log("Admin Cancelled Refund");
            console.log(resultData[0]);
            var message = "We've cancelled your appointment scheduled for " + getFormatedDatetime(booking.local_start_time)+ ", please contact us.";
            //emailer.sendEmailReceiptToUserBooked(resultData[0].email, resultData[0].user_name, booking.creditsUsed, booking.service_price, booking.service_name, booking.local_start_time);
            if (resultData[0].cust_device_token != '' || resultData[0].cust_device_token != 0)
            {
                if (resultData[0].cust_device_type == 1) {
                    sendAndroidPushNotificationToCustomer(resultData[0].cust_device_token, message, 7, booking.id);
                }
                else {
                    sendApplePushNotificationToCustomer(resultData[0].cust_device_token, message, 5, booking.id);
                }
            }
            else
            {
            console.log("Here");
            }

        }
        else {
            console.log(err3);
            sendResponse.somethingWentWrongError(res);
        }
    });

};

exports.cancelBookingOfBooked = cancelBookingOfBooked;


exports.getServiceNameFromServiceType = function (serviceType) {

    var sql = "SELECT `category_name` FROM `categories` WHERE `category_id`=? LIMIT 1";
    connection.query(sql, [serviceType], function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            return result[0].category_name;

        }
    });
};

function dateWithSlashes(date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    //month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    //day = (day < 10 ? "0" : "") + day;


    var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var datesArr = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'
    ,'19','20','21','22','23','24','25','26','27','28','29','30','31'];

    //month = intval(month);
    //day = intval(day);

    month = monthsArr[month-1];
    day = datesArr[day-1];

    return month + " " + day + ", " +year+ " 00:00:00" ;
}
