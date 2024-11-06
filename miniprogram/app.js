// app.js
const {errorModal} = require('./utils/modals')
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'groupbuy-0gh3qh0b8616931f',
        traceUser: true,
      });
    }

    this.globalData = {
      userInfo: null
    };
    this.initAppCallbacks = []
    if(wx.getStorageSync('userInfo')){
      this.initApp().then(()=>{
        this.initAppCallbacks.forEach(callback => callback())
      })
    }

  },
  async initApp(){
    try{
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      const res = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: "getCuruser"
        }  
      })
      if(res.result.errorCode == 0){
        this.globalData.userInfo = res.result.user
        wx.setStorageSync('userInfo', res.result.user)
      }else{
        throw new Error(res.result.errorMessage)
      }
    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  }
});
