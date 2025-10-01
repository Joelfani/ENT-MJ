const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  //publicPath: process.env.NODE_ENV === 'production' ? './' : '/' //avant sur vercel 
  publicPath: '/'
})
