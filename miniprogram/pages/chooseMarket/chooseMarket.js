const {errorModal,navigateBackModal} = require('../../utils/modals')
const eventBus = require('../../utils/eventBus')
// pages/chooseMarket/chooseMarket.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markets: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({title: '加载中...',mask:true})
    try{
      await this.getMarkets()
    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  async getMarkets(){
    const user = wx.getStorageSync('userInfo')
    const marketRes = await wx.cloud.callFunction({
      name: 'groupBuyFunctions',
      data: {
        type: 'getMarket',
        userID: user._id
      }
    })
    const markets = marketRes.result.data;
    if (!markets || markets.length === 0) {
      navigateBackModal("请先加入门店");
    } else {
      this.setData({ markets });
    }
  },
  handleSetMarket(e){
    const index = e.currentTarget.dataset.index
    const market = this.data.markets[index]
    const pages = getCurrentPages()
    const prevPage = pages[pages.length-2]
    wx.showModal({
      title: '提示',
      content: `是否设置${market.name}为当前门店`,
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          wx.showLoading({title: '加载中...',mask:true})
          prevPage.handleSetMarket(market)
          .then(() => {
          wx.hideLoading();
          wx.navigateBack()
          })
          .catch((error) => {
            wx.hideLoading();
            wx.showToast({
              title: '设置失败，请重试',
              icon: 'none'
            });
            console.error('Error setting market:', error);
          });
          
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async refresh(){
    await this.getMarkets()
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh() {
    this.refresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})