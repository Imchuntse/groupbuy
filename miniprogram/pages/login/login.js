// pages/login/login.js
const eventBus = require('../../utils/eventBus')
const {errorModal, noCancelModal,navigateBackModal} = require('../../utils/modals')
const {uploadAvatar} = require('../../utils/uploadData')
const defaultAvatarUrl= 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    newUser:{
      avatarUrl: defaultAvatarUrl,
      nickName: ''
    },
    openid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    await this.checkUser()
  },
  async checkUser(){
    try{
      const res = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: "getCuruser"
        }  
      })
      if(res.result.errorCode == 0){
        this.setData({userInfo: res.result.user})
      }
      if(res.result.errorCode == 1){
        this.setData({openid: res.result.openid})
      }
      if(res.result.errorCode == -1){
        throw new Error(res.result.errorMessage)
      }
      // let user = await getUserByoid(res.result.openid)
      // if(user.length>0){
      //   const avatarUrl = await getSingleAvatar(user[0].fileID)
      //   user[0].avatarUrl = avatarUrl
      //   this.setData({
      //     userInfo:user[0]
      //   })
      // }
    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.newUser
    this.setData({
      "newUser.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.newUser
    this.setData({
      "newUser.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  async handleReg(){
    if(!this.data.hasUserInfo){
      noCancelModal("请完整输入头像和昵称")
    }else{
      wx.showLoading({title: '加载中...',mask:true})
      try{
        const fileID = await uploadAvatar(this.data.openid,this.data.newUser.avatarUrl)
        
        // const userid = await addUser(fileID,this.data.newUser.nickName)
        // const tempUrl = await getSingleAvatar(fileID)
        // let user = {
        //   _id: userid._id,
        //   _openid: this.data.openid,
        //   fileID: fileID,
        //   nickName: this.data.newUser.nickName
        // }
        const userRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'regUser',
            fileID: fileID,
            nickName: this.data.newUser.nickName
          }
        })
        if(userRes.result.errorCode == 0){
          getApp().globalData.userInfo = userRes.result.user
          wx.setStorageSync('userInfo', userRes.result.user)
          eventBus.emit("updateUserInfo",userRes.result.user)
          navigateBackModal("登录成功")
        }else{
          throw new Error(userRes.result.errorMessage)
        }
      }
      catch(err){
        errorModal(err.message)
      }finally{
        wx.hideLoading()
      }
    }
  },
  handleLogin(){
    getApp().globalData.userInfo = this.data.userInfo
    wx.setStorageSync('userInfo',this.data.userInfo)
    eventBus.emit("updateUserInfo",this.data.userInfo)
    navigateBackModal("登录成功")
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