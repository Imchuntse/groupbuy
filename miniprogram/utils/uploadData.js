const moment = require('../miniprogram_npm/moment-timezone/index')
async function uploadAvatar(openid,avatarPath){
  try{
    const res = await wx.cloud.uploadFile({
      cloudPath:`avatars/${openid}-${Date.now()}.png`,
      filePath: avatarPath
    })
    return res.fileID
  }
  catch(err){
    console.log(err)
    throw new Error("上传头像错误请重试")
  }
}
async function uploadExcel(filePath,cloudPath,marketID){
  try{
    const res = await wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    })
    const excelData = await wx.cloud.callFunction({
      name: 'groupBuyFunctions',
      data: {
        type: 'processExcel',
        fileID: res.fileID,
        marketID: marketID
      }
    });
    if (excelData.result.success) {
      excelData.result.data.uploadDate = moment().tz('Australia/Melbourne').format('YYYY-MM-DD')
      excelData.result.data.createDate = excelData.result.data.createDate.substring(0,10)
      return excelData.result.data
    }else{
      console.log(excelData.result.error)
      throw Error(excelData.result.error)
    }
  }catch(err){
    console.log(err)
    throw new Error("上传excel文件失败，请重试")
  }
}

module.exports ={
  uploadAvatar,
  uploadExcel
}