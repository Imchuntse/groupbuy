// pages/createMarket/createMarket.js
const {errorModal,navigateBackModal,noCancelModal} = require('../../utils/modals')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    market:{
      name: "",
      staffs: [],
    },
    staffCode: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  },
  validateUser(userid){
    let staffs = this.data.market.staffs
    const curUser = wx.getStorageSync('userInfo')
    if(curUser._id == userid){
      this.setData({
        staffCode: ""
      })
      throw new Error("无法添加自己")
    }
    if(staffs.includes(userid)){
      this.setData({
        staffCode: ""
      })
      throw new Error("请勿重复添加用户")
    }
  },
  // button handler
  async addUser(){
    if(!this.data.staffCode){
      noCancelModal("请输入成员邀请码")
    }else{
      wx.showLoading({title: '加载中...',mask:true})
      try{
        this.validateUser(this.data.staffCode)
        const userRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data:{
            type: 'getUserByID',
            userID: this.data.staffCode
          }
        })
        if(!userRes.result.errorCode == 0){
          throw new Error(userRes.result.errorMessage)
        }
        const user = userRes.result.user
        let staffs = this.data.market.staffs
        staffs.push(user)
        this.setData({
          'market.staffs': staffs,
          staffCode: ""
        })
        noCancelModal("添加成员成功")
      }catch(err){
        console.log(err)
        errorModal(err.message)
      }finally{
        wx.hideLoading()
      }
    }
  },
  handleRemoveUser(e){
    const index = e.detail.index
    let userList = this.data.market.staffs
    wx.showModal({
      title: '提示',
      content: '你确定要移除该用户吗',
      complete: (res) => {
        if (res.cancel) { 
        }
        if (res.confirm) {
          userList.splice(index,1)
          this.setData({
            "market.staffs": userList
          })
          wx.showToast({
            title: '删除成功',
          })
          
        }
      }
    })
  },
 confirmAddMarket(){
    const market = this.data.market
    if(market.name == ""){
      noCancelModal("门店名字不能为空")
    }else{
      wx.showModal({
        title: '提示',
        content: '确定添加新门店',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
          this.addMarket(market) 
          }
        }
      })
    }
  },
  async addMarket(market){
    let staffs = []
    const curUser = wx.getStorageSync('userInfo')
    staffs.push(curUser._id)
    market.staffs.map(staff =>{
      staffs.push(staff._id)
    })
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const marketRes = await wx.cloud.callFunction({
        name: "groupBuyFunctions",
        data:{
          type: "addMarket",
          userList: staffs,
          marketName: market.name,
          owner: curUser._id
        }
      })
      if(marketRes.result.errorCode == 0){
        navigateBackModal("添加门店成功")
      }else{
        throw new Error(marketRes.result.errorMessage)
      }
    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  //input handler
  handleStaffCodeInput(e){
    this.setData({staffCode: e.detail.value})
  },  
  handleMarketNameInput(e){
    this.setData({"market.name": e.detail.value})
  },
  handleMarketNameClear(){
    this.setData({"market.name": ""})
  },
  handleStaffCodeClear(){
    this.setData({staffCode: ""})
  }
})