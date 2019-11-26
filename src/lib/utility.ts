import path = require("path");
import * as core from "@actions/core";
import { promises as fs, Stats, existsSync } from "fs";
import glob from "tiny-glob";

var zipUtility = require("webdeployment-common-v2/ziputility.js");
/**
 * Validates the input package and finds out input type
 *
 * @param webDeployPkg Web Deploy Package input
 *
 * @return true/false based on input package type.
 */
export async function isInputPkgIsFolder(
  webDeployPkg: string
): Promise<boolean> {
  let stat: Stats;

  try {
    stat = await fs.stat(webDeployPkg);
  } catch (e) {
    throw new Error(`Could not find input pkg`);
  }

  return stat.isFile();
}

export async function findfiles(filepath: string) {
  try {
    return await glob(filepath);
  } catch (e) {
    core.error(e);
    return [];
  }
}

/**
 * Check whether the package contains parameter.xml file
 * @param   webAppPackage   web deploy package
 * @returns boolean
 */
export async function isMSDeployPackage(webAppPackage: string) {
  var isParamFilePresent = false;
  var pacakgeComponent = await zipUtility.getArchivedEntries(webAppPackage);
  if (
    (pacakgeComponent["entries"].indexOf("parameters.xml") > -1 ||
      pacakgeComponent["entries"].indexOf("Parameters.xml") > -1) &&
    (pacakgeComponent["entries"].indexOf("systemInfo.xml") > -1 ||
      pacakgeComponent["entries"].indexOf("systeminfo.xml") > -1 ||
      pacakgeComponent["entries"].indexOf("SystemInfo.xml") > -1)
  ) {
    isParamFilePresent = true;
  }
  core.debug("Is the package an msdeploy package : " + isParamFilePresent);
  return isParamFilePresent;
}
