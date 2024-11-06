const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {marketID,userID,action} = event
  const _ = db.command
  const transcations = await db.startTransaction()
  try{
    if(action == "deleteAdmin"){
      const marketRes = await transcations.collection("markets").where({
        _id: marketID
      }).update({
        data:{
          staffs: _.pull(userID),
          admin: _.pull(userID)
        }
      })
      const userRes = await transcations.collection("users").where({
        _id: userID
      }).update({
        data:{
          markets: _.pull(marketID)
        }
      })
      await transcations.commit();
      return {marketRes,userRes}
    }else{
      const marketRes = await transcations.collection("markets").where({
        _id: marketID
      }).update({
        data:{
          admin: _.pull(userID)
        }
      })
      await transcations.commit();
      return marketRes
    }
  }catch(err){
    await transcations.rollback()
    throw Error(err)
  }
};
