import path = require("path");
import * as core from "@actions/core";
import { promises as fs, Stats } from "fs";
import glob from "tiny-glob";

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
