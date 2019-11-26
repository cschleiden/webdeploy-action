import { promises as fs, readFileSync } from "fs";
import path = require("path");
import * as core from "@actions/core";
import * as io from "@actions/io";
import { exists } from "@actions/io/lib/io-util";
import winreg from "winreg";
import { join } from "path";

const ERROR_FILE_NAME = "error.txt";

/**
 * Constructs argument for MSDeploy command
 *
 * @param   webAppPackage                   Web deploy package
 * @param   webAppName                      web App Name
 * @param   publishingProfile               Azure RM Connection Details
 * @param   removeAdditionalFilesFlag       Flag to set DoNotDeleteRule rule
 * @param   excludeFilesFromAppDataFlag     Flag to prevent App Data from publishing
 * @param   takeAppOfflineFlag              Flag to enable AppOffline rule
 * @param   virtualApplication              Virtual Application Name
 * @param   setParametersFile               Set Parameter File path
 * @param   additionalArguments             Arguments provided by user
 * @param   isParamFilePresentInPacakge     Flag to check Paramter.xml file
 * @param   isFolderBasedDeployment         Flag to check if given web package path is a folder
 *
 * @returns string
 */
export function getMSDeployCmdArgs(
  webAppPackage: string,
  webAppName: string,
  publishingProfile: any, // TODO
  removeAdditionalFilesFlag: boolean,
  excludeFilesFromAppDataFlag: boolean,
  takeAppOfflineFlag: boolean,
  virtualApplication: string,
  setParametersFile: string,
  additionalArguments: string,
  isParamFilePresentInPacakge: boolean,
  isFolderBasedDeployment: boolean,
  useWebDeploy: boolean
): string {
  var msDeployCmdArgs: string = " -verb:sync";

  var webApplicationDeploymentPath = virtualApplication
    ? webAppName + "/" + virtualApplication
    : webAppName;

  if (isFolderBasedDeployment) {
    msDeployCmdArgs += " -source:IisApp=\"'" + webAppPackage + "'\"";
    msDeployCmdArgs +=
      " -dest:iisApp=\"'" + webApplicationDeploymentPath + "'\"";
  } else {
    if (webAppPackage && webAppPackage.toLowerCase().endsWith(".war")) {
      core.debug("WAR: webAppPackage = " + webAppPackage);
      let warFile = path.basename(
        webAppPackage.slice(0, webAppPackage.length - ".war".length)
      );
      let warExt = webAppPackage.slice(webAppPackage.length - ".war".length);
      core.debug("WAR: warFile = " + warFile);
      warFile = virtualApplication
        ? warFile + "/" + virtualApplication + warExt
        : warFile + warExt;
      core.debug("WAR: warFile = " + warFile);
      msDeployCmdArgs += " -source:contentPath=\"'" + webAppPackage + "'\"";
      // tomcat, jetty location on server => /site/webapps/
      core.debug("WAR: dest = /site/webapps/" + warFile);
      msDeployCmdArgs +=
        " -dest:contentPath=\"'/site/webapps/" + warFile + "'\"";
    } else {
      msDeployCmdArgs += " -source:package=\"'" + webAppPackage + "'\"";

      if (isParamFilePresentInPacakge) {
        msDeployCmdArgs += " -dest:auto";
      } else {
        msDeployCmdArgs +=
          " -dest:contentPath=\"'" + webApplicationDeploymentPath + "'\"";
      }
    }
  }

  if (publishingProfile != null) {
    msDeployCmdArgs +=
      ",ComputerName=\"'https://" +
      publishingProfile.publishUrl +
      "/msdeploy.axd?site=" +
      webAppName +
      "'\",";
    msDeployCmdArgs +=
      "UserName=\"'" +
      publishingProfile.userName +
      "'\",Password=\"'" +
      publishingProfile.userPWD +
      "'\",AuthType=\"'Basic'\"";
  }

  if (isParamFilePresentInPacakge) {
    msDeployCmdArgs +=
      " -setParam:name=\"'IIS Web Application Name'\",value=\"'" +
      webApplicationDeploymentPath +
      "'\"";
  }

  if (takeAppOfflineFlag) {
    msDeployCmdArgs += " -enableRule:AppOffline";
  }

  if (useWebDeploy) {
    if (setParametersFile) {
      msDeployCmdArgs += " -setParamFile=" + setParametersFile + " ";
    }

    if (excludeFilesFromAppDataFlag) {
      msDeployCmdArgs += " -skip:Directory=App_Data";
    }
  }

  additionalArguments = additionalArguments ? additionalArguments : " ";
  msDeployCmdArgs += " " + additionalArguments;

  if (!(removeAdditionalFilesFlag && useWebDeploy)) {
    msDeployCmdArgs += " -enableRule:DoNotDeleteRule";
  }

  core.debug("Constructed msDeploy comamnd line arguments");
  return msDeployCmdArgs;
}

/**
 * Gets the full path of MSDeploy.exe
 *
 * @returns    string
 */
export async function getMSDeployFullPath() {
  try {
    var msDeployInstallPathRegKey =
      "\\SOFTWARE\\Microsoft\\IIS Extensions\\MSDeploy";
    var msDeployLatestPathRegKey = await getMSDeployLatestRegKey(
      msDeployInstallPathRegKey
    );
    var msDeployFullPath = await getMSDeployInstallPath(
      msDeployLatestPathRegKey
    );
    msDeployFullPath = msDeployFullPath + "msdeploy.exe";
    return msDeployFullPath;
  } catch (error) {
    core.debug(error);
    return path.join(__dirname, "MSDeploy3.6", "msdeploy.exe");
  }
}

async function getMSDeployLatestRegKey(registryKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var regKey = new winreg({
      hive: winreg.HKLM,
      key: registryKey
    });

    regKey.keys(function(err: any, subRegKeys: any) {
      if (err) {
        reject("Cannot find MSDeploy location in registry");
        return;
      }
      var latestKeyVersion = 0;
      var latestSubKey;
      for (var index in subRegKeys) {
        var subRegKey = subRegKeys[index].key;
        var subKeyVersion = subRegKey.substr(
          subRegKey.lastIndexOf("\\") + 1,
          subRegKey.length - 1
        );
        if (!isNaN(subKeyVersion)) {
          var subKeyVersionNumber = parseFloat(subKeyVersion);
          if (subKeyVersionNumber > latestKeyVersion) {
            latestKeyVersion = subKeyVersionNumber;
            latestSubKey = subRegKey;
          }
        }
      }
      if (latestKeyVersion < 3) {
        reject(
          `Unsupported installed MSDeploy version found: ${latestKeyVersion}`
        );
        return;
      }
      resolve(latestSubKey);
    });
  });
}

function getMSDeployInstallPath(registryKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var regKey = new winreg({
      hive: winreg.HKLM,
      key: registryKey
    });

    regKey.get("InstallPath", function(err: Error, item: winreg.RegistryItem) {
      if (err) {
        reject(`Cannot find MSDeploy location in registry: ${err}`);
        return;
      }
      resolve(item.value);
    });
  });
}

/**
 * 1. Checks if msdeploy during execution redirected any error to
 * error stream ( saved in error.txt) , display error to console
 * 2. Checks if there is file in use error , suggest to try app offline.
 */
export function redirectMSDeployErrorToConsole() {
  var msDeployErrorFilePath = join(
    process.env["GITHUB_WORKSPACE"] || "",
    ERROR_FILE_NAME
  );

  if (exists(msDeployErrorFilePath)) {
    let errorFileContent = readFileSync(msDeployErrorFilePath).toString();

    if (errorFileContent !== "") {
      if (
        errorFileContent.indexOf("ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER") !==
        -1
      ) {
        core.warning("Try deploying again with app offline option set");
      } else if (
        errorFileContent.indexOf(
          "An error was encountered when processing operation 'Delete Directory' on"
        ) !== -1
      ) {
        core.warning("Web deployment already in progress");
      } else if (errorFileContent.indexOf("FILE_IN_USE") !== -1) {
        core.warning("Try to deploy web app with rename option set");
      } else if (errorFileContent.indexOf("transport connection") != -1) {
        errorFileContent =
          errorFileContent + "Update machine to enable secure connection";
      }

      core.error(errorFileContent);
    }

    io.rmRF(msDeployErrorFilePath);
  }
}

export function getWebDeployErrorCode(errorMessage: string): string {
  if (errorMessage !== "") {
    if (
      errorMessage.indexOf("ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER") !== -1
    ) {
      return "ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER";
    } else if (
      errorMessage.indexOf(
        "An error was encountered when processing operation 'Delete Directory' on 'D:\\home\\site\\wwwroot\\app_data\\jobs"
      ) !== -1
    ) {
      return "WebJobsInProgressIssue";
    } else if (errorMessage.indexOf("FILE_IN_USE") !== -1) {
      return "FILE_IN_USE";
    } else if (errorMessage.indexOf("transport connection") != -1) {
      return "transport connection";
    } else if (errorMessage.indexOf("ERROR_CONNECTION_TERMINATED") != -1) {
      return "ERROR_CONNECTION_TERMINATED";
    } else if (
      errorMessage.indexOf("ERROR_CERTIFICATE_VALIDATION_FAILED") != -1
    ) {
      return "ERROR_CERTIFICATE_VALIDATION_FAILED";
    }
  }

  return "";
}

export interface WebDeployResult {
  isSuccess: boolean;
  errorCode?: string;
  error?: string;
}
