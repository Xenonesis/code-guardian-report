// Auto-sync version from package.json
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_VERSION_WITH_PREFIX = `v${packageJson.version}`;