var AWSSettings = require('./AWSSettings'),
    DBSettings = require('./DBSettings');
    genVarSettings = require('./generalVariableSettings');
    emailSettings = require('./emailSettings');

var AllSettings = {
  'aws': AWSSettings,
  'db': DBSettings,
  'genVar': genVarSettings,
  'email': emailSettings
};

var ApplicationSettings = {

getAWSSettings: function() {
                  return ApplicationSettings.getSettingsOf('aws');
                },
getDBSettings: function(){
                 return ApplicationSettings.getSettingsOf('db');
               },
generalVariableSettings: function(){
        return ApplicationSettings.getSettingsOf('genVar');
},
emailSettings: function() {
        return ApplicationSettings.getSettingsOf('email');
    },
getSettingsOf: function(what){
                 //Incase of missing envoirment of wrong name return a null
                 if(!ApplicationSettings.ENV || !AllSettings[what]) {
                   return null;
                 }
                 return AllSettings[what][ApplicationSettings.ENV];
               },

hasAllSettings: function(){
                  for(var name in AllSettings){
                    if(!AllSettings[name][ApplicationSettings.ENV])
                      return false;
                  }
                  return true;
                }
};

module.exports = ApplicationSettings;
