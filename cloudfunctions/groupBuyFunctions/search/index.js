const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})
exports.main = async (event, context) => {
  const db = cloud.database()
  const {selectedType,query,marketID,date} = event
  const _ = db.command
  const phoneRegex = /^\d+$/ 
  try{
    let result = []
    if(selectedType){
      if(phoneRegex.test(query)){
        const custPhoneRes = await db.collection('customers').where({
          contactNum: query,
          marketID: marketID
        }).get()
        result.push(...custPhoneRes.data)
      }
      const custNameRes = await db.collection('customers').where(
        _.and([
          {marketID:marketID},
          _.or([
            {
              name: db.RegExp({
                regexp: query,
                options: 'i'
              })
            },{
              contactName: db.RegExp({
                regexp: query,
                options: 'i'
              })
            }
          ])
        ])
      ).get()
      result.push(...custNameRes.data)
    }else{
      const marketRes = await db.collection('transactions').where({
        recordName: db.RegExp({
          regexp: query,
          options: 'i'
        }),
        marketID: marketID,
        uploadDate: _.gte(date)
      }).get()
      const trans =marketRes.data
      trans.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      });
      result.push(...trans)
    }
    return{
      success: true,
      data: result
    }
  }catch(err){
    return {
      success: false,
      errorMessage: err.message
    };
  }
};
