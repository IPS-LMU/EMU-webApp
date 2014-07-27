#!/bin/sh
if [ -z $1 ]
  then echo "e2e test for EMU-webApp\nusage: ./e2e.sh [nav|spec|utt|all]\n\nexample: ./e2e.sh nav\nto run navigation tests\n"
  else 
    if [ $1 = "nav" ]
      then 
      ./node_modules/protractor/bin/protractor --specs ./test/e2e/main.spec.js,./test/e2e/navigation.spec.js protractor_conf.js
    fi
    if [ $1 = "spec" ]
      then 
      ./node_modules/protractor/bin/protractor --specs ./test/e2e/main.spec.js,./test/e2e/spectroSettings.spec.js protractor_conf.js
    fi 
    if [ $1 = "utt" ]
      then 
      ./node_modules/protractor/bin/protractor --specs ./test/e2e/main.spec.js,./test/e2e/uttFilter.spec.js protractor_conf.js
    fi  
    if [ $1 = "all" ]
      then 
      ./node_modules/protractor/bin/protractor protractor_conf.js
    fi                
fi
