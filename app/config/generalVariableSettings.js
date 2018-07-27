module.exports = {
    "production": {
       "port" : "8001",
       "iosGateway" : "gateway.push.apple.com",
       "pemFile" : "cert.pem",
       "androidKey" : "key",
       "servicePicBaseUrl" : "http://baseurl.s3.amazonaws.com/service/",
       "profilePicBaseUrl" : "http://baseurl.s3.amazonaws.com/profile/",
       "documentBaseUrl" : "http://baseurl.s3.amazonaws.com/documents/",
       "albumBaseUrl" : "http://baseurl.s3.amazonaws.com/",
       "stripeToken" : "stripe_token"
    },
    "development": {
      "port" : "8000",
      "iosGateway" : "gateway.push.apple.com",
      "pemFile" : "cert.pem",
      "androidKey" : "key",
      "servicePicBaseUrl" : "http://baseurl.s3.amazonaws.com/service/",
      "profilePicBaseUrl" : "http://baseurl.s3.amazonaws.com/profile/",
      "documentBaseUrl" : "http://baseurl.s3.amazonaws.com/documents/",
      "albumBaseUrl" : "http://baseurl.s3.amazonaws.com/",
      "stripeToken" : "stripe_token"
    }
};
