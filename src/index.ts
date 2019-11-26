import * as core from "@actions/core";
import { isInputPkgIsFolder, findfiles } from "./lib/utility";
import { DeployUsingMSDeploy } from "./lib/deployusingmsdeploy";

async function run() {
  // Read inputs
  const webSiteName = core.getInput("games", {
    required: true
  });
  const webDeployPackageInput = core.getInput("package", {
    required: true
  });

  var availableWebPackages = await findfiles(webDeployPackageInput);
  if (availableWebPackages.length == 0) {
    throw new Error("Web deploy package not found");
  }

  if (availableWebPackages.length > 1) {
    throw new Error("More than one web deploy package found");
  }

  const webDeployPkg = availableWebPackages[0];
  const isFolderBasedDeployment = await isInputPkgIsFolder(webDeployPkg);

  await DeployUsingMSDeploy(
    webDeployPkg,
    webSiteName,
    null,
    false, // removeAdditionalFilesFlag,
    false, // excludeFilesFromAppDataFlag,
    false, // takeAppOfflineFlag,
    undefined, // virtualApplication,
    undefined, // setParametersFile,
    undefined, // additionalArguments,
    isFolderBasedDeployment,
    true
  );
}

run();
