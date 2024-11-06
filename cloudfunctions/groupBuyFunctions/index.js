const getCuruser = require('./getCuruser/index');
const getUserByID = require('./getUserByID/index')
const addMarket = require('./addMarket/index')
const getMarket = require('./getMarket/index')
const getMarketUser = require('./getMarketUser/index')
const changeUserType = require('./changeUserType/index')
const deleteMarketUser = require('./deleteMarketUser/index')
const removeAdmin = require('./removeAdmin/index')
const addUserToMarket = require('./addUserToMarket')
const regUser = require('./regUser/index')
const processExcel = require('./processExcel/index')
const addTransaction = require('./addTransaction/index')
const getTrans = require('./getTrans/index')
const pickStatus = require('./pickStatus/index')
const getCustTrans = require('./getCustTrans/index')
const getPendingTrans = require('./getPendingTrans/index')
const search = require('./search/index')
const deleteTran = require('./deleteTran/index')
const getTran = require('./getTran/index')
const cancelPicked = require('./cancelPicked/index')
const updateUserInfo = require('./updateUserInfo/index')
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getCuruser':
      return await getCuruser.main(event, context);
    case 'getUserByID':
      return await getUserByID.main(event,context)
    case 'addMarket':
      return await addMarket.main(event,context)
    case 'getMarket':
      return await getMarket.main(event,context)
    case 'getMarketUser':
      return await getMarketUser.main(event,context)
    case 'changeUserType':
      return await changeUserType.main(event,context)
    case 'deleteMarketUser':
      return await deleteMarketUser.main(event,context)
    case 'removeAdmin':
      return await removeAdmin.main(event,context)
    case 'addUserToMarket':
      return await addUserToMarket.main(event,context)
    case 'regUser':
      return await regUser.main(event,context)
    case 'processExcel':
      return await processExcel.main(event,context)
    case 'addTransaction':
      return await addTransaction.main(event,context)
    case 'getTrans':
      return await getTrans.main(event,context)
    case 'pickStatus':
      return await pickStatus.main(event,context)
    case 'getCustTrans':
      return await getCustTrans.main(event,context)
    case 'getPendingTrans':
      return await getPendingTrans.main(event,context)
    case 'search':
      return await search.main(event,context)
    case 'deleteTran':
      return await deleteTran.main(event,context)
    case 'getTran':
      return await getTran.main(event,context)  
    case 'cancelPicked':
      return await cancelPicked.main(event,context) 
    case 'updateUserInfo':
      return await updateUserInfo.main(event,context) 
      default:
        return Error('unknow cloud function type')
  }
  
};
        
