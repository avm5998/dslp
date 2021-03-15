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
    host: 'vclient4.cs.rit.edu',
    port: 8000,
    prefix: ''
  },
  endpoint: ''
};

const {env} = process.env

let config = devConfig

if(env==='build') config = prodConfig

config.endpoint = config.api.protocol + '://' +
  config.api.host + ':' +
  config.api.port + '/' +
  config.api.prefix + '/';

export { config }