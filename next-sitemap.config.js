/** @type {import('next-sitemap').IConfig} */
const siteUrl = 'https://aiguidewebsite.vercel.app'; 

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404'],
};