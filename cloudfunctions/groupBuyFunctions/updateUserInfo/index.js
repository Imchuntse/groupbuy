const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {fileID,nickName,userID,preFileID} = event
  try{
    const updateRes = await db.collection("users").doc(userID).update({
      data:{
        fileID: fileID,
        nickName: nickName,
      }
    })
    if(updateRes.stats.updated> 0 ){
      if( fileID != preFileID){
        await cloud.deleteFile({
          fileList: [preFileID]
        })
      }
    }else{
      return{
        errorCode: -1,
        errorMessage: "更新失败"
      }
    }
    
    const userRes = await db.collection("users").doc(userID).get()
    const user = userRes.data
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
