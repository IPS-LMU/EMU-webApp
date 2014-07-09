#!/bin/sh
if [ -z $1 ]
  then echo "e2e test for EMU-webApp\nusage: ./e2e.sh [nav|spec|utt|all]\n\nexample: ./e2e.sh nav\nto run navigation tests\n"
  else 
    if [ $1 = "nav" ]
      then 
      ./node_modules/protractor/bin/protractor protractor_conf_navigation.js
    fi
    if [ $1 = "spec" ]
      then 
      ./node_modules/protractor/bin/protractor protractor_conf_spectroSettings.js
    fi 
    if [ $1 = "utt" ]
      then 
      ./node_modules/protractor/bin/protractor protractor_conf_uttFilter.js
    fi  
    if [ $1 = "all" ]
      then 
      ./node_modules/protractor/bin/protractor protractor_conf_navigation.js
      ./node_modules/protractor/bin/protractor protractor_conf_spectroSettings.js
      ./node_modules/protractor/bin/protractor protractor_conf_uttFilter.js
    fi                
fi
