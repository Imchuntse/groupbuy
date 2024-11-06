// pages/search/search.js
const eventBus = require('../../utils/eventBus')
const moment = require('../../miniprogram_npm/moment-timezone/index')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    query: '',
    selectedType: true,
    result: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    eventBus.on("transInfo", this.updateTrans.bind(this))
    eventBus.on('tranDelete',this.handleDeleteTran.bind(this))
  },
  handleSearchInput(e){
    this.setData({
      query: e.detail.value
    })
  },
  handleDeleteTran(){
    this.handleSearch()
  },
  async handleSearch(){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const market = getApp().globalData.selectedMarket
      const searchRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data:{
          type:'search',
          selectedType: this.data.selectedType,
          query: this.data.query,
          marketID: market._id,
          date: moment().tz('Australia/Melbourne').subtract(30, 'days').format('YYYY-MM-DD')
        }
      })
      if(searchRes.result.success){
        this.setData({
          result: searchRes.result.data
        })
      }else{
        this.setData({
          result: []
        })
      }
    }catch(err){
      console.log(err)
    }finally{
      wx.hideLoading()
    }
  },
  selectCustType(){
    this.setData({
      selectedType: true,
      result:[]
    })
  },
  selectTranType(){
    this.setData({
      selectedType: false,
      result:[]
    })
  },
  handleClearQuery(){
    this.setData({
      query: ""
    })
  },
  navigaTran(e){
    const index = e.detail.index
    const tran = this.data.result[index]
    getApp().globalData.tran = tran
    wx.navigateTo({
      url: '../tranDetail/tranDetail',
    })
  },
  navigaCust(e){
    const index = e.currentTarget.dataset.index
    const marketID = this.data.result[index].marketID
    const contactNum = this.data.result[index].contactNum
    
    getApp().globalData.custInfo = {marketID: marketID, contactNum: contactNum}
    wx.navigateTo({
      url: '../customerDetail/customerDetail',
    })
  },
  updateTrans(tran) {
    const updatedTrans = this.data.result.map(t => {
      if (t._id === tran._id) {
        return tran; // 如果找到相同 _id 的元素，则返回更新后的 tran 对象
      }
      return t; // 否则返回原来的元素
    });
  
    this.setData({
      result: updatedTrans // 更新页面数据
    });
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
    eventBus.off("transInfo", this.updateTrans.bind(this))
    eventBus.off('tranDelete',this.handleDeleteTran.bind(this))
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