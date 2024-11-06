function loginModal(){
  wx.showModal({
    title: '提示',
    content: '请登录使用团购助手',
    complete: (res) => {
      if (res.confirm) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    }
  })
}
function errorModal(err){
  wx.showModal({
    title: '错误',
    content: err,
    showCancel:false
  })
}


function navigateBackModal(context){
  wx.showModal({
    title: '提示',
    content: context,
    showCancel:false,
    complete: (res) => {
      if (res.confirm) {
        wx.navigateBack()
      }
    }
  })
}


function noCancelModal(context){
  wx.showModal({
    title: '提示',
    content: context,
    showCancel:false,
  })
}
module.exports = {
  loginModal,
  errorModal,
  noCancelModal,
  navigateBackModal
}