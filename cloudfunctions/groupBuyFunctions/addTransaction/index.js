const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})

exports.main = async (event, context) => {
  const { tran } = event;
  
  const db = cloud.database()
  const transaction = await db.startTransaction()
  const _ = db.command
  try{
    const newTransaction = await transaction.collection('transactions').add({
      data:{
        brief: tran.brief,
        trans: tran.trans,
        createDate: tran.createDate,
        recordDate: tran.recordDate,
        recordName: tran.recordName,
        shipRecord: tran.shipRecord,
        uploadDate: tran.uploadDate,
        pending: tran.trans.length,
        marketID : tran.marketID
      }
    })
    const marketUpdateResult = await transaction.collection('markets').doc(String(tran.marketID)).update({
      data:{
        trans: _.addToSet(newTransaction._id)
      }
    })
    if (marketUpdateResult.stats.updated === 0) {
      throw new Error('无效的 marketID');
    }
    for (const t of tran.trans) {
      const res = await transaction.collection('customers').where({
        contactNum: t.contactNum,
        marketID: tran.marketID
      }).get();

      if (res.data.length > 0) {
        // 更新现有客户记录
        await transaction.collection('customers').doc(res.data[0]._id).update({
          data: {
            trans: _.addToSet(newTransaction._id),
            name: t.name,
            contactName: t.contactName,
          }
        });
        
      } else {
        // 添加新的客户记录
        await transaction.collection('customers').add({
          data: {
            name: t.name,
            contactName: t.contactName,
            trans: [newTransaction._id],
            contactNum: t.contactNum,
            marketID: tran.marketID
          }
        });
      }
    }
    await transaction.commit();
    // const market = await db.collection('markets').doc(String(marketID)).get()
    // const allTrans = await db.collection('transactions').where({
    //   _id: _.in(market.data.trans)
    // }).get()
    // return {
    //   errorCode: 0,
    //   trans: allTrans.data
    // }
    return {
      success: true,
      tranID: newTransaction._id
    };
  } catch (err) {
    await transaction.rollback()
    return {
      success: false,
      errorMessage: err.message
    };
  }
};

