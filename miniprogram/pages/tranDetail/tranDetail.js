const { errorModal,navigateBackModal } = require("../../utils/modals")
const eventBus = require('../../utils/eventBus')

// pages/tranDetail/tranDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tran: null,
    showBrief: false,
    userType: 2,
    showPending: true,
    showPicked: true,
    pendingTran:[],
    pickedTran:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    eventBus.on("transInfo", this.updateTrans.bind(this))
    let tran = getApp().globalData.tran
    if(tran){
      this.splitTrans(tran)
      this.setData({
        userType: getApp().globalData.userType
      })
    }else{
      errorModal("订单信息获取失败，请返回重试");
    }


  },
  async refresher(){
    const tran = getApp().globalData.tran
    if(tran){
      try{
        const tranRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data:{
            type:'getTran',
            tranID: tran._id
          }
        })
        if(tranRes.result.success){
          this.splitTrans(tranRes.result.message)
        }else{
          throw new Error(tranRes.result.message)
        }
      }catch(err){
        console.log(err)
        eventBus.emit("tranDelete")
        navigateBackModal("获取订单信息错误")
      }
      
    }else{
      navigateBackModal("获取订单信息错误")
    }
    wx.stopPullDownRefresh();
  },
  updateTrans(tran){
    if(tran._id == this.data.tran._id){
      this.splitTrans(tran)
    }
  },
  splitTrans(tran){
    const pending = tran.trans.filter(t=> t.collect == false)
    const picked = tran.trans.filter(t=>t.collect == true)
    this.setData({
      tran: tran,
      pendingTran: pending,
      pickedTran: picked
    })
  },
  toggleBrief(){
    this.setData({showBrief: !this.data.showBrief})
  },
  togglePending(){
    this.setData({showPending: !this.data.showPending})
  },
  togglePicked(){
    this.setData({showPicked: !this.data.showPicked})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  async handlePick(e){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const index = e.detail.index
      const status = e.detail.status
      let tranRes
      if(status == 'pick'){
        const custIndex = this.data.pendingTran[index].index
        tranRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'pickStatus',
            tranID: this.data.tran._id,
            index: custIndex
          }
        })
      }
      else{
          const custIndex = this.data.pickedTran[index].index
          tranRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'cancelPicked',
            tranID: this.data.tran._id,
            index: custIndex
          }
        })
      }

      if(tranRes.result.errCode == 0 || tranRes.result.errCode == 1){
        eventBus.emit('transInfo',tranRes.result.data)
        this.splitTrans(tranRes.result.data)
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
        navigateBackModal(tranRes.result.errmessge)
      }        

    }catch(err){
      errorModal(err.message)
    }
  },
  handlePickNavigaCustDetail(e){
    const index = e.detail.index
    const contactNum = this.data.pickedTran[index].contactNum
    this.navigaCustDetail(contactNum)
  },
  handlePendingNavigaCustDetail(e){
    const index = e.detail.index
    const contactNum = this.data.pendingTran[index].contactNum
    this.navigaCustDetail(contactNum)
  },
  navigaCustDetail(contactNum){
    const marketID = this.data.tran.marketID
    getApp().globalData.custInfo = {marketID: marketID, contactNum: contactNum}
    wx.navigateTo({
      url: '../customerDetail/customerDetail',
    })
  },
  deleteTran(){
    wx.showModal({
      title: '提示',
      content: '是否删除该团购订单',
      complete: (res) => {
        if (res.cancel) {
        }
    
        if (res.confirm) {
          this.handleDeleteTran()
        }
      }
    })
  },
  async handleDeleteTran(){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const deleteRes =await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'deleteTran',
          tranID: this.data.tran._id,
        }
      })
      if(deleteRes.result.success){
        wx.showToast({
          title: '删除成功',
        })
        navigateBackModal("删除成功")
      }else{
        throw new Error('删除失败，请重试')
        
      }
    }catch(err){
      console.log(err)
      navigateBackModal(err.message)
    }finally{
      eventBus.emit("tranDelete")
      wx.hideLoading()
    }
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
    eventBus.off("transInfo", this.updateTrans.bind(this))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refresher()
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