import admZip from "adm-zip";

/**
 *  Returns array of files present in archived package
 */
export async function getArchivedEntries(
  archivedPackage: string
): Promise<{
  entries: string[];
}> {
  const zip = new admZip(archivedPackage);
  const entries = zip.getEntries();
  return {
    entries: entries.map(e => e.entryName)
  };
}
