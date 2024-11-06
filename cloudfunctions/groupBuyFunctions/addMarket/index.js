// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: "groupbuy-0gh3qh0b8616931f" }) // 使用当前云环境

// cloud.init({ env: "wx4a8fa7734da1b587" })
// 云函数入口函数
exports.main = async (event, context) => {
  const {userList, marketName,owner} = event
  const db = cloud.database()
  const _ = db.command
  const transactions = await db.startTransaction()
  try{
      const queryRes = await db.collection("markets").where({
      name: marketName
    }).get()
      if(queryRes.data && queryRes.data.length>0){
        return {
          errorCode: 1,
          errorMessage: "门店名字已被使用"
        }
      }
      const newMarket = await transactions.collection("markets").add({
        data:{
          name: marketName,
          staffs: userList,
          owner: owner,
          admin: [],
          trans: []
        },
      })
      const marketId = newMarket._id
      for (let user of userList) {  
        await transactions.collection('users').doc(String(user)).update({
          data: {
            markets: _.addToSet(marketId)
          }
        })
      }
      await transactions.commit();
      return {
        errorCode: 0,
        data: newMarket
      }
  }catch(err){
    await transactions.rollback()
    return {
      errorCode: -2,
      errorMessage: err.message
    }
  }
}