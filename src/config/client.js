let config = {
    api: {
      protocol: 'http',
      host: 'localhost',
      port: 9000,
      prefix: ''
    },
    endpoint:''
  };
  
  config.endpoint = config.api.protocol + '://' +
    config.api.host + ':' +
    config.api.port + '/' +
    config.api.prefix + '/';

  export {config}