const cloud = require('wx-server-sdk');
const getMarketUser = require('../getMarketUser')
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {marketID,userID,actionType} = event
  const _ = db.command
  const transcations = await db.startTransaction()
  try{
    let updateData = {}
    if(actionType == 'deleteAdmin'){
      updateData = {
        admin: _.pull(userID),
        staffs: _.pull(userID)
      }
    }else{
      updateData ={
        staffs: _.pull(userID)
      }
    }
    const updatemarketRes = await transcations.collection("markets").where({
      _id: marketID
    }).update({
      data: updateData
    })
    const userRes = await transcations.collection("users").where({
      _id: userID
    }).update({
      data:{
        markets: _.pull(marketID)
      }
    })
    if (updatemarketRes.stats.updated > 0 && userRes.stats.updated > 0) {
      await transcations.commit()
      const marketRes = await getMarketUser.main(event,context)
      if(marketRes.errCode == 0){
        return {
          success: true,
          market:marketRes.market
        }
      }else{
        throw new Error(marketRes.errorMessage)
      }
    } else {
      await transcations.rollback()
      return {
        success: false,
        errorMessage: '更新失败或未修改任何记录'
      }
    }
  }catch(err){
    await transcations.rollback()
    return {
      success: false,
      errorMessage: err.message
    }
  }
};
