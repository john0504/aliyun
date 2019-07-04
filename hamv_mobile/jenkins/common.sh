./scripts/apply_env_script.sh
npm i

npm install cordova-set-version
tag=`git describe --abbrev=0 --tags`
commit=`git rev-parse --short HEAD`
npx cordova-set-version -v "${tag}_${commit}"

branch=$GIT_BRANCH
if [[ -z "$branch" ]]; then
  branch=`git branch | grep \* | cut -d ' ' -f2`
fi
domain=`cat src/app/app.config.ts | grep solutionId | tail -1 | cut -d "'" -f  2`
echo "Branch: $branch" > notes.txt
echo "Env.: $domain" >> notes.txt
echo $ReleaseNotes
echo $ReleaseNotes >> notes.txt
