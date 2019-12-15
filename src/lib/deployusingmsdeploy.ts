import fs = require("fs");
import path = require("path");
import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import {
  getMSDeployCmdArgs,
  getMSDeployFullPath,
  redirectMSDeployErrorToConsole
} from "./msdeployutility";

const DEFAULT_RETRY_COUNT = 3;

/**
 * Executes Web Deploy command
 *
 * @param   webDeployPkg                   Web deploy package
 * @param   webAppName                      web App Name
 * @param   publishingProfile               Azure RM Connection Details
 * @param   removeAdditionalFilesFlag       Flag to set DoNotDeleteRule rule
 * @param   excludeFilesFromAppDataFlag     Flag to prevent App Data from publishing
 * @param   takeAppOfflineFlag              Flag to enable AppOffline rule
 * @param   virtualApplication              Virtual Application Name
 * @param   setParametersFile               Set Parameter File path
 * @param   additionalArguments             Arguments provided by user
 *
 */
export async function DeployUsingMSDeploy(
  webDeployPkg: string,
  webAppName: string,
  publishingProfile: any,
  removeAdditionalFilesFlag: boolean,
  excludeFilesFromAppDataFlag: boolean,
  takeAppOfflineFlag: boolean,
  virtualApplication?: string,
  setParametersFile?: string,
  additionalArguments?: string,
  isFolderBasedDeployment?: boolean,
  useWebDeploy?: boolean
) {
  var msDeployPath = await getMSDeployFullPath();
  var msDeployDirectory = msDeployPath.slice(
    0,
    msDeployPath.lastIndexOf("\\") + 1
  );
  var pathVar = process.env.PATH;
  process.env.PATH = msDeployDirectory + ";" + process.env.PATH;

  core.debug(`Found msdeploy path: '${msDeployPath}'`);

  var msDeployCmdArgs = getMSDeployCmdArgs(
    webDeployPkg,
    webAppName,
    publishingProfile,
    removeAdditionalFilesFlag,
    excludeFilesFromAppDataFlag,
    takeAppOfflineFlag,
    virtualApplication || "",
    "", //setParametersFileName,
    additionalArguments || "",
    false, //isParamFilePresentInPackage,
    !!isFolderBasedDeployment,
    !!useWebDeploy
  );

  let retryCount = DEFAULT_RETRY_COUNT;
  try {
    while (true) {
      try {
        retryCount -= 1;
        await executeMSDeploy(msDeployCmdArgs);
        break;
      } catch (error) {
        if (retryCount == 0) {
          throw error;
        }
        core.info(error);
        core.info("Retrying deployment");
      }
    }
    if (publishingProfile != null) {
      core.info("Package deployment succeeded");
    }
  } catch (error) {
    core.error("Package deployment failed");
    core.debug(JSON.stringify(error));
    redirectMSDeployErrorToConsole();
    throw Error(error.message);
  } finally {
    process.env.PATH = pathVar;
    if (setParametersFile != null) {
      io.rmRF(setParametersFile);
    }
  }
}

function argStringToArray(argString: string): string[] {
  var args = [];
  var inQuotes = false;
  var escaped = false;
  var arg = "";
  var append = function(c: string) {
    // we only escape double quotes.
    if (escaped && c !== '"') {
      arg += "\\";
    }
    arg += c;
    escaped = false;
  };
  for (var i = 0; i < argString.length; i++) {
    var c = argString.charAt(i);
    if (c === '"') {
      if (!escaped) {
        inQuotes = !inQuotes;
      } else {
        append(c);
      }
      continue;
    }
    if (c === "\\" && inQuotes) {
      if (escaped) {
        append(c);
      } else {
        escaped = true;
      }

      continue;
    }
    if (c === " " && !inQuotes) {
      if (arg.length > 0) {
        args.push(arg);
        arg = "";
      }
      continue;
    }
    append(c);
  }
  if (arg.length > 0) {
    args.push(arg.trim());
  }
  return args;
}

async function executeMSDeploy(msDeployCmdArgs: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let msDeployError: Error | null = null;
    var msDeployErrorFilePath = path.join(
      process.env["GITHUB_WORKSPACE"] || "",
      "error.txt"
    );
    var fd = fs.openSync(msDeployErrorFilePath, "w");
    var errObj = fs.createWriteStream("", { fd: fd });

    errObj.on("finish", () => {
      if (msDeployError) {
        reject(msDeployError);
      }
    });

    try {
      core.debug("the argument string is:");
      core.debug(msDeployCmdArgs);
      core.debug("converting the argument string into an array of arguments");
      msDeployCmdArgs = argStringToArray(msDeployCmdArgs);
      core.debug("the array of arguments is:");
      for (var i = 0; i < msDeployCmdArgs.length; i++) {
        core.debug("arg#" + i + ": " + msDeployCmdArgs[i]);
      }
      await exec.exec("msdeploy", msDeployCmdArgs, {
        failOnStdErr: true,
        errStream: errObj,
        windowsVerbatimArguments: true
      });

      resolve("Azure App service successfully deployed");
    } catch (error) {
      msDeployError = error;
    } finally {
      errObj.end();
    }
  });
}
