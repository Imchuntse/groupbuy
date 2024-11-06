const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {marketID,date} = event
  const _ = db.command
  try{
    const market = await db.collection('markets').doc(String(marketID)).get();
    if(market.data.trans && market.data.trans.length>0){
      const allTrans = await db.collection('transactions').where({
        _id: _.in(market.data.trans),
        uploadDate: date
      }).get()
      return {
        errorCode: 0,
        trans: allTrans.data,
        market: market.data
      }
    } else{
      return {
        errorCode: 1,
        errorMessage: "未查询到该门店的团购订单",
        market: market.data,
        trans: []
      }
    }

  }catch(err){
    throw Error(err)
  }
};
