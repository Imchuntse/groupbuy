const eventBus = require("../../utils/eventBus")
const { errorModal, navigateBackModal } = require("../../utils/modals")
const {uploadAvatar} = require('../../utils/uploadData')
// pages/modifyUserInfo/modifyUserInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: "",
    avatarUrl: "",
    userInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      userInfo: userInfo
    })
  },
  onInputChange(e){
    this.setData({
      nickName:e.detail.value
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl
    })
  },
  async handleChange(){
    if(this.data.nickName != this.data.userInfo.nickName || this.data.avatarUrl!= this.data.userInfo.avatarUrl){
      try{     
        wx.showLoading({
          title: '加载中...',mask:true
        })
        const fileID = this.data.avatarUrl == this.data.userInfo.avatarUrl ? this.data.userInfo.fileID : await uploadAvatar(this.data.userInfo._openid,this.data.avatarUrl)
        const userRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'updateUserInfo',
          fileID: fileID,
          preFileID:this.data.userInfo.fileID,
          nickName: this.data.nickName,
          userID: this.data.userInfo._id
        }
      })
      if(userRes.result.errorCode == 0){
        const user = userRes.result.user
        eventBus.emit('updateUserInfo', user)
        getApp().globalData.userInfo = user
        wx.setStorageSync('userInfo', user)
        navigateBackModal("更改信息成功")
      }else{
        throw new Error(userRes.errorMessage)
      }
    }catch(err){
      console.log(err)
      errorModal("更新信息失败")
    }finally{
      wx.hideLoading()
    }
    }else{
      errorModal("未更改账号信息")
    }
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