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
   * @description 后台地址，用于解决跨域
   */
  devServer: 'http://localhost:8080',
  /**
   * @type {string}
   * @description 后台所需的key
   */
  key: 'wx6e26d78ff8614da2'
}
