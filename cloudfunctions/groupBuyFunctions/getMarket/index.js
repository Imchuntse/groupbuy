const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const userID = event.userID
  const _ = db.command
  try{
    const userRes = await db.collection('users').doc(userID).get()
    if(userRes.data.markets){
      const res = await db.collection("markets").where({
        _id: _.in(userRes.data.markets)
      }).get()
      return res
    }
    else{
      return []
    }
    
  }catch(err){
    throw Error(err)
  }
};
