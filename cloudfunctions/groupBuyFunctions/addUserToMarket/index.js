const cloud = require('wx-server-sdk');
const getMarketUser = require('../getMarketUser')
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {marketID,userID} = event
  const _ = db.command
  const transcations = await db.startTransaction()
  try{
    const UserRes = await db.collection("users").where({
      _id: userID
    }).get()
    if(UserRes.data.length<=0){
      return {
        errorCode: 1,
        errorMessage: "无法找到用户，请检查邀请码"
      }
    }
    const updateMarketRes = await transcations.collection('markets').doc(String(marketID)).update({
      data:{
        staffs: _.addToSet(userID)
      }
    })
    const updateUserRes = await transcations.collection('users').doc(String(userID)).update({
      data:{
        markets: _.addToSet(marketID)
      }
    })
    if(updateMarketRes.stats.updated > 0 && updateUserRes.stats.updated > 0){
      await transcations.commit();
      const marketRes = await getMarketUser.main(event,context)
      if(marketRes.errCode ==0){
        return {
          errorCode: 0,
          market:marketRes.market
        }
      }else{
        throw new Error(marketRes.errorMessage)
      }
    }else{
      await transcations.rollback()
      return {
        errorCode: -1,
        errorMessage: '更新失败或未修改任何记录'
      }
    }


  }catch(err){
    await transcations.rollback()
    return {
      errorCode: -1,
      errorMessage: err.message
    }
  }
};
