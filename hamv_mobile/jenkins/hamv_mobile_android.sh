cp -r ~/app/plugins ~/node_modules .
./jenkins/common.sh
npx ionic cordova build android --prod
