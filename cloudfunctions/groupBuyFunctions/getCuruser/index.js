const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  try{
    const wxContext = await cloud.getWXContext()
    const res = await db.collection("users").where({
      _openid: wxContext.OPENID
    }).get()
    if(res.data.length<=0){
      return {
        errorCode: 1,
        openid: wxContext.OPENID,
        errorMessage:"无法找到用户，请重试"
      }
    }
    const user = res.data[0]
    const avatarUrl = await cloud.getTempFileURL({
      fileList: [user.fileID]
    })
    user.avatarUrl = avatarUrl.fileList[0].tempFileURL
    return {
      errorCode: 0,
      user: user
    }
  }catch(err){
    return{
      errorCode: -1,
      errorMessage: err.message
    }
  }



};
