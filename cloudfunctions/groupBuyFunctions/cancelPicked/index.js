const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})

exports.main = async (event, context) => {
  const db = cloud.database();
  const { tranID, index } = event;
  const _ = db.command;
  
  try {
    // 获取当前 trans.${index}.collect 的值

    const tranRes = await db.collection('transactions').where({
      _id:tranID
    }).get();
    if(!tranRes.data.length>0){
      return{
        errCode: -1,
        errmessge: "无法找到该订单消息",
      }
    }
    const tran = tranRes.data[0]

    const currentCollect = tran.trans[index].collect;
    // 检查 currentCollect 是否为 false
    if (currentCollect === true) {
      // 更新 trans 数组中的指定元素，并将 pending 减少 1
      await db.collection('transactions').doc(tranID).update({
        data: {
          pending: _.inc(1),
          [`trans.${index}.collect`]: false
        }
      });
    } 
      // 回滚事务
    const updatedTran = await db.collection('transactions').doc(tranID).get();
    return{
      errCode: 0,
      data: updatedTran.data
    }

  } catch (err) {
    throw err.message;
  }
};