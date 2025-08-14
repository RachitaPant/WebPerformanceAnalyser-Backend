module.exports = {
  apps: [
    {
      name: "web-performance-analyser",
      script: "./dist/index.js",
      watch: false,
      instances: 1,
      autorestart: true,
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
