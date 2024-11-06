const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {marketID,userID,actionType} = event
  const _ = db.command
  try{
    let updateData = {};
    if (actionType == 'addAdmin') {
      const marketRes = await db.collection('markets').doc(marketID).get()
      if(!marketRes.data.staffs.includes(userID)){
        return {
          success: false
        }
      }
      updateData = {
        admin: _.addToSet(userID)
      };
    } else {
      updateData = {
        admin: _.pull(userID)
      };
    }
    const res = await db.collection('markets').doc(marketID).update({
      data: updateData
    });
    if (res.stats.updated > 0) {
      return {
        success: true,
        message: '更新成功'
      };
    } else {
      return {
        success: false,
        message: '更新失败或未修改任何记录'
      };
    }
  }catch(err){
    return {
      success: false,
      message: '更新失败：' + err.errMsg
    };
  }
}