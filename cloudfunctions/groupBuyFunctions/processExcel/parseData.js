function parseData(excelData,marketID){
  let records = [];
  let items = new Map();
  let index = -1;
  let shipRecord, recordDate, recordName, createDate;
  const addItemToMap = (itemName,qty,unit,price) =>{
    if(items.has(itemName)){
      const {qty: curQty} = items.get(itemName)
      items.set(itemName,{qty:qty+curQty,unit:unit,price:price})
    }else{
      items.set(itemName, {qty:qty,unit:unit,price:price})
    }
  }
  const createShopItem = (transcation) =>({
    itemName: transcation['商品'],
    price: transcation['单价'],
    qty: transcation['数量'],
    unit: transcation['数量单位']
  })
  const createRecord = (transcation) => ({
    name: transcation['姓名'],
    level: transcation['楼层'],
    totalPrice: transcation['总价'],
    contactName: transcation['联系人'],
    contactNum: transcation['联系方式'],
    note: transcation['用户备注'],
    orderNote: transcation['群主备注'],
    orderCreator: transcation['团'],
    collect: false,
    shopedItems: []
  });
  const newExcelData = excelData.slice(1).forEach(transcation => {
    const itemName = transcation['商品'];
    const lvl = transcation['楼层'];
    if(lvl){
      if (lvl.startsWith('发货配送')) {
        shipRecord = lvl;
      } else if (lvl.startsWith('制单日期')) {
        recordDate = new Date(lvl.split('：')[1].trim())
      } else if (lvl.startsWith('团购主题')) {
        recordName = lvl.split('：')[1]
      } else if (lvl.startsWith('创建时间')) {
        createDate = new Date(lvl.split('：')[1].trim())
      }
    }
    if (itemName) {
      addItemToMap(itemName, transcation['数量'],transcation['数量单位'], transcation['单价']);
      const shopedItem = createShopItem(transcation);
      if (lvl) {
        const record = createRecord(transcation);
        record.shopedItems.push(shopedItem);
        records.push(record);
        index += 1;
      } else {
        if (index >= 0 && records[index].shopedItems) {
          records[index].shopedItems.push(shopedItem);
        }else{
          throw new Error("加载数据失败")
        }
      }
    }
  });
  let itemsArray = [];
  for (const [key, value] of items.entries()) {
    const item ={
      name: key,
      qty: value.qty,
      unit: value.unit,
      price: value.price
    }
    itemsArray.push(item)
  }
  const recordsWithIndex = records.map((item, index) => ({
    ...item,
    index
  }));
  const groupBuyTranscation = {trans: recordsWithIndex,shipRecord:shipRecord, recordDate:recordDate, recordName:recordName, createDate:createDate,brief:itemsArray, pending: records.length,marketID:marketID}
  return groupBuyTranscation
}
module.exports={
  parseData
}