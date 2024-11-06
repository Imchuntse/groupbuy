const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const marketID = event.marketID
  const _ = db.command
  try{
    const res = await db.collection("markets").where({
      _id: marketID
    }).get()
    let market = res.data[0]
    const users = await db.collection("users").where({
      _id: _.in(market.staffs)
    }).get()
    let userInfo = users.data
    let fileIDs = userInfo.map(user => user.fileID);
    const urlRes = await cloud.getTempFileURL({
      fileList: fileIDs
    })
    urlRes.fileList.forEach((file, index)=>{
      userInfo[index].avatarUrl = file.tempFileURL
    })
    market.staffsInfo = userInfo
    return {
      errCode: 0,
      market: market
    }
  }catch(err){
    return{
      errCode: -1,
      errorMessage: err.message
    }
  }
};
