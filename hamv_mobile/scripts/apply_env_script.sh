main()
{
  local target_widget_id="com.microvert.mobile"

  local target_solution_id="hamv2-stg"
  local target_env="${target_solution_id}.apps.exosite.io"
  local target_product_id="c46w2egr9wem00000"

  local target_fb_app_id="429411750748999"
  local target_app_name="Micro-Vertical App"

  local target_scheme="breezey"
  local target_hockey_app_android_id="22fba48496734bb1ad580c42c106f5b0"
  local target_hockey_app_ios_id="69d31567d64146e0bd5e0f66d7b0b623"
  local target_theme_product_name="Breezey"
  local target_theme_wifi_name="Breezey-XXXX"

  # Can be branch name, tag, commit hash
  local taret_app_engine_ver="2.0.0"

  local blue=`tput setaf 4`
  local cyan=`tput setaf 6`
  local green=`tput setaf 2`
  local red=`tput setaf 1`
  local reset=`tput sgr0`
  local yellow=`tput setaf 3`

  local ori_env="smarthome.apps.exosite.io"
  local ori_fb_app_id="MY_APP_ID"
  local ori_fb_app_name="My App Name"
  local ori_prod_name="myproduct"

  # Change this to your target folder paht!
  local target_folder_path="./"

  # 1: app version, e.g. 1.3.0
  # if [ "$1" = '' ]
  # then
  #   echo "${red}ERROR: Please input the app engine version (e.g. 1.3.0) and run the script again.${reset}"
  #   return 1
  # fi

  update_config_xml
  update_package_json $1
  update_app_config
}

update_app_config()
{
  ori_solution_id="smarthome"
  ori_product_id=""
  ori_hockey_app_android_id=""
  ori_hockey_app_ios_id=""
  ori_theme_product_name="Product Name"
  ori_theme_wifi_name="WifiName-XXXX"

  app_path="src/app"
  app_config_file="app.config.ts"
  echo "${blue}Start to do the clean task for ${cyan}\"${app_config_file}\"${reset}"

  eval cd ${target_folder_path}"/"${app_path}

  # Update the solutionId
  sed -i '' -e "s/solutionId: '"${ori_solution_id}"',/solutionId: '"${target_solution_id}"',/g" ${app_config_file}
  sed -i '' -e "s/productId: '"${ori_product_id}"',/productId: '"${target_product_id}"',/g" ${app_config_file}

  # Update the hockey app id
  sed -i '' -e "s/android: '"${ori_hockey_app_android_id}"',/android: '"${target_hockey_app_android_id}"',/g" ${app_config_file}
  sed -i '' -e "s/ios: '"${ori_hockey_app_ios_id}"',/ios: '"${target_hockey_app_ios_id}"',/g" ${app_config_file}

  # Update the theme variables
  sed -i '' -e "s/productName: '""${ori_theme_product_name}""',/productName: '""${target_theme_product_name}""',/g" ${app_config_file}
  sed -i '' -e "s/wifiName: '"${ori_theme_wifi_name}"',/wifiName: '"${target_theme_wifi_name}"',/g" ${app_config_file}

  # Back to the origin folder
  cd -

  echo "${green}Clean "${app_config_file}" done!${reset}"
}

update_config_xml()
{
  ori_widget_id="com.example.myapp"

  config_file="config.xml"
  echo "${blue}Start to do the clean task for ${cyan}\"${config_file}\"${reset}"

  eval cd ${target_folder_path}

  # Update the widget id
  sed -i '' -e 's/<widget id="'${ori_widget_id}'"/<widget id="'${target_widget_id}'"/g' ${config_file}

  # Update the facebook plugin variables
  sed -i '' -e 's/<variable name="APP_ID" value="'${ori_fb_app_id}'"/<variable name="APP_ID" value="'${target_fb_app_id}'"/g' ${config_file}
  sed -i '' -e 's/<variable name="APP_NAME" value="'"${ori_fb_app_name}"'"/<variable name="APP_NAME" value="'"${target_app_name}"'"/g' ${config_file}

  sed -i '' -e 's/<string name="fb_app_id">'${ori_fb_app_id}'/<string name="fb_app_id">'${target_fb_app_id}'/g' ${config_file}
  sed -i '' -e 's/<string name="fb_app_name">'"${ori_fb_app_name}"'/<string name="fb_app_name">'"${target_app_name}"'/g' ${config_file}

  # Update the deep link plugin variables
  sed -i '' -e 's/<variable name="URL_SCHEME" value="'${ori_prod_name}'"/<variable name="URL_SCHEME" value="'${target_scheme}'"/g' ${config_file}
  sed -i '' -e 's/<variable name="DEEPLINK_SCHEME" value="'${ori_prod_name}'"/<variable name="DEEPLINK_SCHEME" value="'${target_scheme}'"/g' ${config_file}
  sed -i '' -e 's/<variable name="DEEPLINK_HOST" value="'${ori_env}'"/<variable name="DEEPLINK_HOST" value="'${target_env}'"/g' ${config_file}

  # Back to the origin folder
  cd -

  echo "${green}Clean "${config_file}" done!${reset}"
}

update_package_json()
{
  app_engine_version=$1
  semi_folder="semi_vertical_app_engine"
  micro_folder="micro_vertical_app_engine"
  package_file="package.json"
  echo "${blue}Start to do the clean task for ${cyan}\"${package_file}\"${reset}"

  eval cd ${target_folder_path}

  # Update app engine folder name and version
  # sed -i '' -e 's/"app-engine": "exosite\/'${semi_folder}'.*"/"app-engine": "exosite\/'${micro_folder}'#v'${app_engine_version}'"/g' ${package_file}

  # Update the facebook plugin variables
  sed -i '' -e 's/"APP_ID": "'${ori_fb_app_id}'",/"APP_ID": "'${target_fb_app_id}'",/g' ${package_file}
  sed -i '' -e 's/"APP_NAME": "'"${ori_fb_app_name}"'"/"APP_NAME": "'"${target_app_name}"'"/g' ${package_file}

  # Update the deep link plugin variables
  sed -i '' -e 's/"URL_SCHEME": "'${ori_prod_name}'",/"URL_SCHEME": "'${target_scheme}'",/g' ${package_file}
  sed -i '' -e 's/"DEEPLINK_SCHEME": "'${ori_prod_name}'",/"DEEPLINK_SCHEME": "'${target_scheme}'",/g' ${package_file}
  sed -i '' -e 's/"DEEPLINK_HOST": "'${ori_env}'",/"DEEPLINK_HOST": "'${target_env}'",/g' ${package_file}

  # Back to the origin folder
  cd -

  echo "${green}Clean "${package_file}" done!${reset}"
}

main $*
