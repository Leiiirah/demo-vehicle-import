module.exports = {
  apps: [
    {
      name: 'vhlimport-api',
      script: 'dist/main.js',
      cwd: '/var/www/vhlimport/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
