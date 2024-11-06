const cloud = require('wx-server-sdk');
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const {tranID} = event;
  const _ = db.command;
  const transaction = await db.startTransaction(); // Start a transaction

  try {
    const tranRes = await transaction.collection("transactions").doc(tranID).get();
    
    const tranData = tranRes.data; // Assuming there's only one transaction with that ID
    const marketID = tranData.marketID
    // Update customers collection
    for (const t of tranData.trans) {
      await transaction.collection("customers").where({
        contactNum: t.contactNum,
        marketID: tranData.marketID
      }).update({
        data: {
          trans: _.pull(tranID)
        }
      });
    }

    // Update markets collection
    await transaction.collection('markets').where({
      _id: tranData.marketID
    }).update({
      data: {
        trans: _.pull(tranID)
      }
    });

    // Remove transaction
    const removeRes = await transaction.collection('transactions').doc(tranID).remove();

    // Commit transaction
    await transaction.commit();
    return {
      success: true,
      data: removeRes
    };
  } catch (err) {
    await transaction.rollback();
    return {
      success: false,
      errorMessage: err.message
    };
  }
};
