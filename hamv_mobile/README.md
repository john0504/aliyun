# Exosite ExoHome

#### Build process:
1. Use text editor to open `./script/apply_env_script.sh` and edit `target_*` variables.
2. Run `./script/apply_env_script.sh`
3. Run `npm i`
4. Run `ionic cordova platform add ios -r && ionic cordova platform add android -r`
5. Run `ionic cordova build/run <platform>`

> **Note**: Make sure run `./script/apply_env_script.sh` with execution permission. Run `chmod +x ./script/apply_env_script.sh` to grant execution permission to script.