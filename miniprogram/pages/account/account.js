// pages/account/account.js
const eventBus = require('../../utils/eventBus')
const {loginModal} = require('../../utils/modals')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    eventBus.on("updateUserInfo",this.updateUserInfo.bind(this))
    if(getApp().globalData.userInfo){
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
    }else{
      getApp().initAppCallbacks.push(()=>{
        this.setData({
          userInfo: getApp().globalData.userInfo
        })
      })
    }
  },


//emit functions
  updateUserInfo(updatedInfo){
    this.setData({
      userInfo: updatedInfo
    })
  },


//click handle functions
  handleRequireLogin:function(){
    loginModal()
  },
  handleSignout(){
    wx.removeStorageSync('userInfo')
    eventBus.emit("updateUserInfo",null)
  },
  handleCopy(){
    if(this.data.userInfo){
      this.copyCode()
    }else{
      this.handleRequireLogin()
    }
  },



//navigation functions
  navigaCreateMarket(){
    wx.navigateTo({
      url: '../createMarket/createMarket',
    })
  },
  navigaManageMarket(){
    wx.navigateTo({
      url: '../manageMarket/manageMarket',
    })
  },
  navigaModifyUserInfo(){
    wx.navigateTo({
      url: '../modifyUserInfo/modifyUserInfo',
    })
  },



  copyCode() {
    wx.setClipboardData({
      data: this.data.userInfo._id,
      success: function(){
        wx.showToast({
          title: '复制邀请码成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '复制邀请码失败',
          duration: 1000
        })
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
    eventBus.off('updateUserInfo',this.updateUserInfo.bind(this))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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