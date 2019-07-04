npm i -g ionic@3 cordova
./jenkins/common.sh
security unlock-keychain -p "slave" /Users/jenkins/Library/Keychains/login.keychain-db
npx ionic cordova build ios --device --prod
