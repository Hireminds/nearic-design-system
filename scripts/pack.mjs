// Stage regular dependency files so npm pack can include exact-version bundles from workspaces.
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';

const output = path.resolve('dist/downloads');
await mkdir(output, {recursive:true});
const stage = await mkdtemp(path.join(tmpdir(), 'nearic-pack-'));
const packages = {};
try {
  for (const name of ['tokens','ui-core','ui-box']) {
    const source = path.resolve('packages',name);
    const workspace = path.join(stage,name);
    const pkg = JSON.parse(await readFile(path.join(source,'package.json'),'utf8'));
    await mkdir(workspace);
    for (const file of ['package.json','dist']) await cp(path.join(source,file),path.join(workspace,file),{recursive:true});
    for (const dependency of pkg.bundleDependencies ?? []) {
      const bundle = packages[dependency];
      if (!bundle || pkg.dependencies[dependency] !== bundle.version) throw new Error('Unbuilt dependency: ' + dependency);
      const target = path.join(workspace,'node_modules',dependency);
      await mkdir(target,{recursive:true});
      execFileSync('tar',['xzf',path.join(output,bundle.filename),'--strip-components=1','-C',target]);
    }
    const [artifact] = JSON.parse(execFileSync('npm',['pack','--pack-destination',output,'--json'],{cwd:workspace,encoding:'utf8'}));
    const {name: packageName, version, filename, integrity} = artifact;
    packages[packageName] = {name:packageName,version,filename,integrity};
  }
  await writeFile(path.join(output,'package.json'),JSON.stringify({version:packages['@nearic/ui-box'].version,packages},null,2)+'\n');
} finally {
  await rm(stage,{recursive:true,force:true});
}
