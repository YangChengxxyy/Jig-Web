/**
 * 设置
 * @type {{devServer: string, fixedHeader: boolean, sidebarLogo: boolean, title: string}}
 */
module.exports = {

  title: '工夹具全寿命管理系统',
  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false,
  /**
   * @type {string}
   * @description 后台地址，用于解决跨域，仅限开发环境使用
   */
  // devServer: 'http://jig.yycccloud.cn:8081',
  devServer: 'http://localhost:8081',
  // http: 'jig.yycccloud.cn:8081'
  http: 'localhost:8081'
}
