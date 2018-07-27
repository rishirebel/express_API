module.exports = {
	"production": {
		"awsBucket" : "bucket_name",
		"awsSecretKey" : "secret_key",
		"awsAccessKey" : "access_key",
		"options" : {
			"storageType" : "STANDARD",
			"acl" : "private",
			"checkMD5" : true
		}
	},
	"development": {
		"awsBucket" : "bucket_name",
		"awsSecretKey" : "secret_key",
		"awsAccessKey" : "access_key",
		"options" : {
			"storageType" : "STANDARD",
			"acl" : "private",
			"checkMD5" : true
		}
	}
};
