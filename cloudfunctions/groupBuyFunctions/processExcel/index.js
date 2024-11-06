const cloud = require('wx-server-sdk');
const XLSX = require('xlsx');
const {parseData} = require('./parseData')
cloud.init({
  env: "groupbuy-0gh3qh0b8616931f"
})

exports.main = async (event, context) => {
  const { fileID,marketID } = event;
  
  try {
    // 下载文件
    const res = await cloud.downloadFile({
      fileID
    });
    const buffer = res.fileContent;

    // 解析Excel文件
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet);
    // 返回解析结果
    
    await cloud.deleteFile({
      fileList: [fileID]
    })
    const excelData = parseData(sheetData,marketID)
    if(excelData.trans.length == 0 && excelData.brief.length == 0){
      return{
        success: false,
        errMessage: "文件解析失败"
      }
    }
    return {
      success: true,
      data: excelData
    };
  } catch (error) {
    console.error('文件解析失败', error);
    return {
      success: false,
      error
    };
  }
};

