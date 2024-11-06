const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const tranID = event.tranID
  try{
    const res = await db.collection("transactions").where({
      _id: tranID
    }).get()
    if(res.data.length<=0){
      return {
        success: false,
        message: "无法找到订单消息"
      }
    }
    return{
      success: true,
      message: res.data[0]
    }
  }catch(err){
    return{
      success:false,
      message: err.message
    }
  }
};
