const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const { marketID, contactNum, date } = event;
  const _ = db.command;
  
  try {
    // 获取客户信息
    const custRes = await db.collection("customers").where({
      marketID: marketID,
      contactNum: contactNum
    }).get();
    
    // 检查是否找到客户
    if (custRes.data.length === 0) {
      return {
        errCode: 1,
        errMsg: '未找到客户'
      };
    }
    
    const customer = custRes.data[0];
    
    // 获取交易信息
    const transRes = await db.collection('transactions').where({
      _id: _.in(customer.trans),
      uploadDate: _.gte(date)
    }).get();
    
    // 处理交易数据
    const custTrans = transRes.data.map(t => {
      const shopedItems = t.trans.filter(ts => ts.contactNum == contactNum);
      return {
        date: t.uploadDate,
        transaction_id: t._id,
        name: t.recordName,
        trans: shopedItems
      };
    });
    custTrans.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    return {
      errCode: 0,
      trans: custTrans,
      customer: customer
    };
  } catch (err) {
    return {
      errCode: 500,
      errMsg: `服务器错误：${err.message}`
    };
  }
};