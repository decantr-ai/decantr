export async function cmdPublish(
  type: string,
  name: string,
  projectRoot: string = process.cwd(),
): Promise<void> {
  void projectRoot;
  console.error(
    `Hosted community publishing has been retired. Keep ${type}/${name} in the official corpus under packages/content and run \`decantr content check\`.`,
  );
  process.exitCode = 1;
}
