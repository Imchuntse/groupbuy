// pages/customerDetail/customerDetail.js
const {errorModal, navigateBackModal} = require('../../utils/modals')
const eventBus = require('../../utils/eventBus')
const moment = require('../../miniprogram_npm/moment-timezone/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customer: null,
    trans: [],
    pendingTran: [],
    pickedTran:[],
    showPending: true,
    showPicked: false,
    userType:2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const info = getApp().globalData.custInfo
    this.setData({
      userType:getApp().globalData.userType
    }) 
    if(info){
      await this.getCustTrans(info)
    }else{
      errorModal("订单信息获取失败，请返回重试")
    }
    
  },
  togglePending(){
    this.setData({showPending: !this.data.showPending})
  },
  togglePicked(){
    this.setData({showPicked: !this.data.showPicked})
  },
  async getCustTrans(info){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const res = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data:{
          type:'getCustTrans',
          contactNum:info.contactNum,
          marketID: info.marketID,
          date: moment().tz('Australia/Melbourne').subtract(30, 'days').format('YYYY-MM-DD')
        }
      })
      if(res.result.errCode == 0){
        this.setData({
          customer: res.result.customer,
          trans: res.result.trans
        })
        this.splitTran()
      }else{
        console.log(res)
        throw new Error('加载用户失败请重试')
      }

    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  splitTran(){
    const trans = this.data.trans
    const pendingTran = trans.map(t=> {
      const pendingItems = t.trans.filter(i => i.collect == false)
      if(pendingItems.length>0){
        return{
          date:t.date,
          name: t.name,
          trans: pendingItems,
          transaction_id: t.transaction_id
        } 
      }else{
        return null
      }
    }).filter(Boolean)
    const pickedTran = trans.map(t =>{
      const pickedItem = t.trans.filter(i => i.collect == true)
      if(pickedItem.length>0){
        return{
          date:t.date,
          name: t.name,
          trans: pickedItem,
          transaction_id: t.transaction_id
        } 
      }else{
        return null
      }

    }).filter(Boolean)
    this.setData({
      pendingTran: pendingTran,
      pickedTran: pickedTran
    })
  },
  async handlePick(e){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const tranIndex = e.detail.tranIndex
      const itemsIndex = e.detail.itemsIndex
      const status = e.detail.status
      let tranRes
      if(status == 'pick'){
        const tid = this.data.pendingTran[tranIndex].transaction_id
        const itemIndex = this.data.pendingTran[tranIndex].trans[itemsIndex].index
        tranRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'pickStatus',
            tranID: tid,
            index: itemIndex
          }
        })
      }else{
        const tid = this.data.pickedTran[tranIndex].transaction_id
        const itemIndex = this.data.pickedTran[tranIndex].trans[itemsIndex].index
        tranRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'cancelPicked',
            tranID: tid,
            index: itemIndex
          }
        })
      }
      if(tranRes.result.errCode == 0 || tranRes.result.errCode == 1){
        eventBus.emit('transInfo',tranRes.result.data)
        this.updateTran(tranRes.result.data)
        if(tranRes.result.errCode==0){
          wx.showToast({
            title: '更改订单状态成功',
          })
        }
      }
      if(tranRes.result.errCode == 1){
        throw new Error(tranRes.result.errmessge)
      } 
      if(tranRes.result.errCode == -1){
        eventBus.emit("tranDelete")
        errorModal("无法找到该订单消息")
        const info = {
          contactNum : this.data.customer.contactNum,
          marketID: this.data.customer.marketID
        }
        this.getCustTrans(info)
      }
    }catch(err){
      errorModal(err.message)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  updateTran(tran){
    const updatedTrans = this.data.trans.map(t => {
      if(t.transaction_id == tran._id){
        const pending = tran.trans.filter(ts => ts.contactNum == this.data.customer.contactNum)
        return {
          date: tran.uploadDate,
          transaction_id: tran._id,
          name: tran.recordName,
          trans: pending
        }
      }
      return t
    })
    this.setData({
      trans: updatedTrans
    })
    this.splitTran()
  },
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
    const info = getApp().globalData.custInfo
    await this.getCustTrans(info)
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