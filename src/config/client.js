let devConfig = {
  api: {
    protocol: 'http',
    host: 'localhost',
    port: 9000,
    prefix: ''
  },
  endpoint: ''
};

let prodConfig = {
  api: {
    protocol: 'http',
    host: 'vclient5.cs.rit.edu',
    port: 5000,
    prefix: ''
  },
  endpoint: ''
};

const {env} = process.env

let config = devConfig

if(env==='build') config = prodConfig

config.endpoint = config.api.protocol + '://' +
  config.api.host +
  (config.api.port?':'+config.api.port + '/' :'')+
  config.api.prefix + '/';

if (config.endpoint.endsWith('//')) config.endpoint = config.endpoint.substring(0,config.endpoint.length-1)

export { config }