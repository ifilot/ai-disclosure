import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  faBookOpen,
  faCheck,
  faCircleInfo,
  faCode,
  faCopy,
  faDownload,
  faExclamation,
  faFileLines,
  faFlask,
  faPenRuler,
  faRobot,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { pages, scripts, styles } from './site-files.mjs';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const bootstrap = dirname(require.resolve('bootstrap/package.json'));
const version = require('@fortawesome/free-solid-svg-icons/package.json').version;

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of [...pages, ...scripts, ...styles]) {
  mkdirSync(dirname(join(output, name)), { recursive: true });
  copyFileSync(join(root, 'site', name), join(output, name));
}

const css = readFileSync(join(bootstrap, 'dist/css/bootstrap.min.css'), 'utf8');
writeFileSync(join(output, 'bootstrap.min.css'), css.replace(/\/\*# sourceMappingURL=.*\*\//, ''));
copyFileSync(join(bootstrap, 'LICENSE'), join(output, 'bootstrap-license.txt'));
writeFileSync(join(output, '.nojekyll'), '');

const icons = [faBookOpen, faCheck, faCircleInfo, faCode, faCopy, faDownload, faExclamation, faFileLines, faFlask, faPenRuler, faRobot, faUser, faXmark];
const credit = `<!-- Icons by Font Awesome Free ${version} (https://fontawesome.com), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). -->`;
const symbols = icons.map(({ iconName, icon: [width, height, , , paths] }) => {
  const content = [paths].flat().map(path => `<path d="${path}"/>`).join('');
  return `<symbol id="${iconName}" viewBox="0 0 ${width} ${height}">${content}</symbol>`;
});
writeFileSync(join(output, 'icons.svg'), `<svg xmlns="http://www.w3.org/2000/svg">\n${credit}\n${symbols.join('\n')}\n</svg>\n`);

const [robotWidth, robotHeight, , , robotPath] = faRobot.icon;
writeFileSync(join(output, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
${credit}
<rect width="40" height="40" rx="9" fill="#62446d"/>
<svg x="7" y="7" width="26" height="26" viewBox="0 0 ${robotWidth} ${robotHeight}"><path fill="#fff" d="${robotPath}"/></svg>
</svg>\n`);

execFileSync(process.execPath, [join(root, 'scripts/generate-badges.mjs'), join(output, 'badges')], { stdio: 'inherit' });
console.log('Static site ready in dist/.');
