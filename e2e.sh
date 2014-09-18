#!/bin/sh
if [ -z $1 ]
  then echo "e2e test for EMU-webApp\nusage: ./e2e.sh [demoDB|dragndrop] [nav|spec|utt|all]\n\nexample: ./e2e.sh demoDB nav\nto run navigation tests on demoDB\n"
  else 
    if [ $1 = "demoDB" ]  
    then
      if [ $2 = "nav" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/demoDB/main.spec.js,./test/e2e/demoDB/navigation.spec.js protractor_conf_demoDB.js
      fi
      if [ $2 = "spec" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/demoDB/main.spec.js,./test/e2e/demoDB/spectroSettings.spec.js protractor_conf_demoDB.js
      fi 
      if [ $2 = "utt" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/demoDB/main.spec.js,./test/e2e/demoDB/uttFilter.spec.js protractor_conf_demoDB.js
      fi  
      if [ $2 = "all" ]
        then 
        ./node_modules/protractor/bin/protractor protractor_conf_demoDB.js
      fi      
    else
      if [ $2 = "nav" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/dragndrop/main.spec.js,./test/e2e/dragndrop/navigation.spec.js protractor_conf_dragndrop.js
      fi
      if [ $2 = "spec" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/dragndrop/main.spec.js,./test/e2e/dragndrop/spectroSettings.spec.js protractor_conf_dragndrop.js
      fi 
      if [ $2 = "utt" ]
        then 
        ./node_modules/protractor/bin/protractor --specs ./test/e2e/dragndrop/main.spec.js,./test/e2e/dragndrop/uttFilter.spec.js protractor_conf_dragndrop.js
      fi  
      if [ $2 = "all" ]
        then 
        ./node_modules/protractor/bin/protractor protractor_conf_dragndrop.js
      fi     
    fi            
fi
