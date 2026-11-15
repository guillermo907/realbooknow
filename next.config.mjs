import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const basePath=process.env.NEXT_PUBLIC_BASE_PATH||'';if(basePath&&!/^\/(?:[a-zA-Z0-9_-]+\/?)+$/.test(basePath))throw Error('Invalid NEXT_PUBLIC_BASE_PATH');if(basePath.endsWith('/'))throw Error('Base path must not end with /');
export default {basePath,env:{NEXT_PUBLIC_BASE_PATH:basePath},output:'export',trailingSlash:true,images:{unoptimized:true},outputFileTracingRoot:root,webpack(config,{dev}){if(dev)config.watchOptions={...config.watchOptions,poll:1000,ignored:['**/node_modules/**','**/.next/**','**/scripts/accompaniment-eval/output/**']};return config;}};
