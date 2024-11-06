const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const marketID = event.marketID
  const date = event.date
  const _ = db.command
  try{
    const marketRes = await db.collection('markets').doc(marketID).get()
    if(marketRes.data.trans && marketRes.data.trans.length>0){
      const transRes = await db.collection('transactions').where({
        _id: _.in(marketRes.data.trans),
        uploadDate: _.gte(date)
      }).get()
      const pendingTrans = transRes.data.filter(t => t.pending != 0)
      const filterTrans = pendingTrans.map(t=>{
        const uncollectItems = t.trans.filter(item =>item.collect == false)
        t.trans = uncollectItems
        return t
      })
      filterTrans.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      });
      return{
        errCode: 0,
        pendingTrans: filterTrans,
        market: marketRes.data
      }
    }else{
      return{
        errCode: 0,
        errMessage: "该门店没有订单消息",
        pendingTrans: [],
        market: marketRes.data
      }
    }
    
  }catch(err){
    throw Error(err)
  }
};
