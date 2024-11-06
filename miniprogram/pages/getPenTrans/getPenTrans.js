const { errorModal } = require("../../utils/modals")
const eventBus = require('../../utils/eventBus')
const moment = require('../../miniprogram_npm/moment-timezone/index')
// pages/getPenTrans/getPenTrans.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marketInfo: null,
    pendingTrans:[],
    selectedTransIndices: {} 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    eventBus.on("transInfo", this.handleTranUpdate.bind(this))
    eventBus.on("tranDelete", this.loadPendingTrans.bind(this))
    this.loadPendingTrans()
  },
  async loadPendingTrans(){
    const market = getApp().globalData.selectedMarket
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const pendingTransRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'getPendingTrans',
          marketID: market._id,
          date: moment().tz('Australia/Melbourne').subtract(30, 'days').format('YYYY-MM-DD')
        }
      })
      
      if(pendingTransRes.result.errCode == 0){
        this.setData({
          marketInfo: pendingTransRes.result.market,
          pendingTrans: pendingTransRes.result.pendingTrans
        })
      }else{
        throw new Error("获取门店订单失败请重试")
      }

    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
    
  },
  
  async handlePick(e){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const itemIndex = e.detail.index
      const tranIndex = e.currentTarget.dataset.tranindex;
      const pickTran = this.data.pendingTrans[tranIndex]
      const tranRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'pickStatus',
          tranID: pickTran._id,
          index: pickTran.trans[itemIndex].index
        }
      })
      if(tranRes.result.errCode == 0 || tranRes.result.errCode == 1){
        eventBus.emit('transInfo',tranRes.result.data)
        if(tranRes.result.errCode==0){
          wx.showToast({
            title: '更改订单状态成功',
          })
        }
      }
      if(tranRes.result.errCode == 1){
        throw new Error(tranRes.result.errmessge)
      }
      if(tranRes.result.errCode == -1 ){
        errorModal("获取该订单信息错误")
        this.loadPendingTrans()
      }        

    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  handleTranUpdate(tranInfo){
    const updatedTrans = this.data.pendingTrans.map(t => {
      if (t._id === tranInfo._id) {
        const pending = tranInfo.trans.filter(ts=> ts.collect == false)
        const newTranInfo = { ...tranInfo, trans: pending };
        return newTranInfo; // 如果找到相同 _id 的元素，则返回更新后的 tran 对象
      }
      return t; // 否则返回原来的元素
    });
    this.setData({
      pendingTrans: updatedTrans // 更新页面数据
    });
  },
  toggleTrans: function(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      [`selectedTransIndices.${index}`]: !this.data.selectedTransIndices[index]
    });
  },
  navigaCustDetail(e){
    const itemIndex = e.detail.index
    const tranIndex = e.currentTarget.dataset.tranindex;
    const marketID = this.data.marketInfo._id
    const contactNum = this.data.pendingTrans[tranIndex].trans[itemIndex].contactNum
    getApp().globalData.custInfo = {marketID: marketID, contactNum: contactNum}
    wx.navigateTo({
      url: '../customerDetail/customerDetail',
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
    eventBus.off("transInfo", this.handleTranUpdate.bind(this))
    eventBus.off("tranDelete", this.loadPendingTrans.bind(this))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async refresh(){
    await this.loadPendingTrans()
    wx.stopPullDownRefresh();
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