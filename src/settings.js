/**
 * 设置
 * @type {{devServer: string, fixedHeader: boolean, sidebarLogo: boolean, title: string}}
 */
module.exports = {

  title: 'Vue Admin Template',
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
   * @description 后台地址，用于解决跨域
   */
  devServer: 'http://localhost:8080'
}
