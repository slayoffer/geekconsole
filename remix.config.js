/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  tailwind: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverModuleFormat: 'cjs',
  future: {},
  serverDependenciesToBundle: [
    '@supabase/auth-ui-react',
    '@supabase/supabase-js',
    'nanoid',
  ],
};
