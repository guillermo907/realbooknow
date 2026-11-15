import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
export default {output:'export',trailingSlash:true,images:{unoptimized:true},outputFileTracingRoot:root,webpack(config,{dev}){if(dev)config.watchOptions={...config.watchOptions,poll:1000,ignored:['**/node_modules/**','**/.next/**','**/scripts/accompaniment-eval/output/**']};return config;}};
