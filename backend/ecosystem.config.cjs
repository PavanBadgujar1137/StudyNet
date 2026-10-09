// PM2: pm2 start ecosystem.config.cjs
// UAT -> :4000 | Production -> :6000

module.exports = {
  apps: [
    {
      name: "openhand-api-uat",
      script: "index.js",
      cwd: __dirname,
      instances: 1,
      env: {
        APP_ENV: "uat",
        NODE_ENV: "production",
      },
    },
    {
      name: "openhand-api",
      script: "index.js",
      cwd: __dirname,
      instances: 1,
      env: {
        APP_ENV: "production",
        NODE_ENV: "production",
      },
    },
  ],
}
