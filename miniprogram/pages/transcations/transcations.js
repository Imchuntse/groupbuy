// pages/transcations/transcations.js
const eventBus = require('../../utils/eventBus')
const {loginModal, errorModal} = require('../../utils/modals')
const {uploadExcel} = require('../../utils/uploadData')
const moment = require('../../miniprogram_npm/moment-timezone/index')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    trans: [],
    marketInfo: null,
    date: null, 
    userType: 2
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    eventBus.on("updateUserInfo",this.updateUserInfo.bind(this))
    eventBus.on("transInfo", this.updateTrans.bind(this))
    eventBus.on('tranDelete',this.handleDeleteTran.bind(this))
    this.setData({
      date: moment().tz('Australia/Melbourne').format('YYYY-MM-DD')
    })
    if(getApp().globalData.userInfo){
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
      this.checkMarket()
    }else{
      getApp().initAppCallbacks.push(()=>{
        this.setData({
          userInfo: getApp().globalData.userInfo
        })
        this.checkMarket()
      })
    }
  },
  async checkMarket(){
    const markets = this.data.userInfo.markets
    if(markets && markets.length>0){
      await this.updateMarketInfo(markets[0])
    }
  },

  async refresh(){
    if(!this.data.userInfo){
      this.handleRequireLogin()
    }else{
      const market = this.data.marketInfo
      if(market){
        await this.updateMarketInfo(market._id)
      }else{
        errorModal("请先选择门店")
      }
    }
    wx.stopPullDownRefresh();
  },

// events bust emit functions
  updateUserInfo(updatedInfo){
    this.setData({
      userInfo: updatedInfo,
      marketInfo: updatedInfo ? this.data.marketInfo : null,
      trans: updatedInfo ? this.data.tran : null
    })
  },
  updateTrans(tran) {
    const updatedTrans = this.data.trans.map(t => {
      if (t._id === tran._id) {
        return tran; // 如果找到相同 _id 的元素，则返回更新后的 tran 对象
      }
      return t; // 否则返回原来的元素
    });
  
    this.setData({
      trans: updatedTrans // 更新页面数据
    });
  },
  handleDeleteTran(){
    this.refresh()
  },
//choose market page update marketinfo
  async handleSetMarket(marketInfo){
    await this.updateMarketInfo(marketInfo._id)
  },

  handleRequireLogin(){
    loginModal()
  },

//navigation functions
  navigaGetPenTrans(){
    if(this.data.userInfo){
      if(this.data.marketInfo){
        wx.navigateTo({
          url: '../getPenTrans/getPenTrans',
        })
      }else{
        errorModal("请先选择门店")
      }
    }else{
      this.handleRequireLogin()
    }
  },
  navigaTran(e){
    const index = e.detail.index
    const tran = this.data.trans[index]
    getApp().globalData.tran = tran
    wx.navigateTo({
      url: '../tranDetail/tranDetail',
    })
  },
  navigaSearch(){
    if(this.data.userInfo){
      if(this.data.marketInfo){
        wx.navigateTo({
          url: '../search/search',
        })
      }else{
        errorModal("请先选择门店")
      }
    }else{
      this.handleRequireLogin()
    }

    
  },
  chooseMarket(){
    if(this.data.userInfo){
      wx.navigateTo({
        url: '../chooseMarket/chooseMarket'
      })
    }else{
      this.handleRequireLogin()
    }
    
  },


  bindDateChange(e){
    this.setData({
      date: e.detail.value
    });
    this.updateMarketInfo(this.data.marketInfo._id)
  },

  async updateMarketInfo(marketID){
      try{
        wx.showLoading({title: '加载中...',mask:true})
        const marketRes = await wx.cloud.callFunction({
          name: 'groupBuyFunctions',
          data: {
            type: 'getTrans',
            marketID: marketID,
            date: this.data.date
          }
        })
        let userType = 2
        marketRes.result.market.admin.includes(this.data.userInfo._id) ? userType= 1 : marketRes.result.market.owner == this.data.userInfo._id ? userType = 0 : userType = 2
        this.setData({
          userType: userType,
          trans: marketRes.result.trans,
          marketInfo: marketRes.result.market
        })
        getApp().globalData.userType = userType
        getApp().globalData.selectedMarket = marketRes.result.market
      }catch(err){
        console.log(err)
        errorModal(err.message)
      }finally{
        wx.hideLoading()
      }
  },
  async chooseExcel(){
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xlsx', 'xls'],
      success: async (res) => {
        const filePath = res.tempFiles[0].path;
        const cloudPath = `excel/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.xlsx`;
        try{
          wx.showLoading({title: '加载中...',mask:true})
          const excelData = await uploadExcel(filePath,cloudPath,this.data.marketInfo._id,)
          const tranRes =await wx.cloud.callFunction({
            name: 'groupBuyFunctions',
            data: {
              type: 'addTransaction',
              tran: excelData,
              date: this.data.date
            }
          })
          if(tranRes.result.success){
            if(excelData.uploadDate == this.data.date){
              let tempTrans = this.data.trans || []
              excelData._id = tranRes.result.tranID
              tempTrans.push(excelData)
              this.setData({
                trans: tempTrans
              })
            }
            wx.showToast({
              title: '添加订单成功',
            })
          }else{
            throw new Error(tranRes.result.errorMessage)
          }

        }catch(err){
          errorModal(err.message)
        }finally{
          wx.hideLoading()
        }
      }
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
    eventBus.off('updateUserInfo',this.updateUserInfo.bind(this))
    eventBus.off("transInfo", this.updateTrans.bind(this))
    eventBus.off('tranDelete',this.handleDeleteTran.bind(this))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
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