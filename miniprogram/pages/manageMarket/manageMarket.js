const {navigateBackModal,errorModal, noCancelModal} = require('../../utils/modals')
const eventBus = require('../../utils/eventBus')
// pages/manageMarket/manageMarket.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    marketInfo: null,
    userType: 2,
    ownerInfo: null,
    adminsInfo: [],
    staffsInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const curUser = wx.getStorageSync('userInfo')
    if(curUser.markets.length>0){
      await this.getMarketInfo(curUser.markets[0])
    }
  },

//handle setMarket function
  async handleSetMarket(market){
    await this.getMarketInfo(market._id)
  },
//get market info functions
  async getMarketInfo(marketID){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const marketRes = await wx.cloud.callFunction({
        name: "groupBuyFunctions",
        data:{
          type: 'getMarketUser',
          marketID: marketID
        }
      })
      if(marketRes.result.errCode == 0 ){
        this.userTypeOwnerAdmin(marketRes.result.market)
      }else{
        console.log(marketRes.result.errorMessage)
        throw new Error('加载门店信息错误')
      }
    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },
  userTypeOwnerAdmin(market){
    const curUser = wx.getStorageSync('userInfo')
    const userType = market.owner == curUser._id ? 0 : market.admin.includes(curUser._id) ? 1 : 2
    const owner = market.staffsInfo.filter(u => u._id == market.owner)
    const admins = market.staffsInfo.filter(u => market.admin.includes(u._id))
    const staffs = market.staffsInfo.filter(u => !market.admin.includes(u._id) && u._id!= market.owner)
    this.setData({
      marketInfo:market,
      userType: userType,
      ownerInfo: owner,
      adminsInfo: admins,
      staffsInfo: staffs
    })
  },

  //navigate functions
  navigaChooseMarket(){
    wx.navigateTo({
      url: '../chooseMarket/chooseMarket',
    })
  },


//handle button add user
  handleAddUser(){
    const that = this
    wx.showModal({
      title: '请输入用户邀请码',
      content: '',
      editable: true,
      placeholderText: '',
      success(res) {
        if (res.confirm) {
          that.data.marketInfo.staffs.includes(res.content) ? noCancelModal('该用户已在门店中') : that.addUserToMarket(res.content)
        }
      }
  });
},
  handleQuitMarket(){
    wx.showModal({
      title: '提示',
      content: '是否要退出门店',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
         this.quitMarket() 
        }
      }
    })
  },
  async quitMarket(){
    wx.showLoading({title: '加载中...',mask:true})
    const actionType = this.data.userType == 1 ? 'deleteAdmin' : 'deleteStaff'
    const curUser = wx.getStorageSync('userInfo')
    try{
      const marketRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'deleteMarketUser',
          marketID: this.data.marketInfo._id,
          userID: curUser._id,
          actionType: actionType
        }
      })
      if(marketRes.result.success){
        this.setData({
          marketInfo: null,
          userType: 2,
          ownerInfo: null,
          adminsInfo: [],
          staffsInfo: []
        })
      }else{
        console.log(marketRes)
        throw new Error("退出门店失败，请重新打开页面尝试")
      }
    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },

//handle add user in market functions
  async addUserToMarket(userID){
    try{
      wx.showLoading({title: '加载中...',mask:true})
      const marketRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'addUserToMarket',
          marketID: this.data.marketInfo._id,
          userID: userID
        }
      })
      if(marketRes.result.errorCode == 0){
        this.userTypeOwnerAdmin(marketRes.result.market)
        wx.showToast({
          title: '添加成员成功'
        })
      }else{
        console.log(marketRes.result.errorMessage)
        throw new Error("添加用户失败，请重新打开页面尝试")
      }
    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },


// handle modify UserType 
  async modifyUserType(userID,actionType){
    wx.showLoading({title: '加载中...',mask:true})
    try{
      const addRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'changeUserType',
          marketID: this.data.marketInfo._id,
          userID: userID,
          actionType: actionType
        }
      })
      if(addRes.result.success){
        let admin = this.data.marketInfo.admin
        if(actionType == 'addAdmin'){
          admin.push(userID)
        }else{
          const index = admin.indexOf(userID);
          if (index !== -1) {
            admin.splice(index, 1);
          }
        }
        this.setData({
          'marketInfo.admin': admin
        })
        this.userTypeOwnerAdmin(this.data.marketInfo)
      }else{
        console.log(addRes)
        throw new Error(actionType == 'addAdmin' ? "添加管理员失败，请重新打开页面尝试" : "移除管理员失败，请重新打开页面尝试")
      }
    }catch(err){
      console.log(err)
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },


  async deleteStaff(userID,actionType){
    wx.showLoading({title: '加载中...',mask:true})
    try{
      const marketRes = await wx.cloud.callFunction({
        name: 'groupBuyFunctions',
        data: {
          type: 'deleteMarketUser',
          marketID: this.data.marketInfo._id,
          userID: userID,
          actionType: actionType
        }
      })
      if(marketRes.result.success){
        this.setData({
          marketInfo: marketRes.result.market
        })
        this.userTypeOwnerAdmin(this.data.marketInfo)
      }else{
        console.log(marketRes)
        throw new Error("移除成员失败，请重新打开页面尝试")
      }
    }catch(err){
      errorModal(err.message)
    }finally{
      wx.hideLoading()
    }
  },

//handle modify admin functions 
  modifyAdmin(e){
    const index = e.detail.index
    this.actionSheet(this.data.adminsInfo[index],'admin')
  },


//handle modify staff functions
  modifyStaff(e){
    const index = e.detail.index
    this.actionSheet(this.data.staffsInfo[index],'staff')
  },

//action sheet
  actionSheet(staff,userType){
    const itemList  = userType == 'staff' ? [`设为管理员 (${staff.nickName})`,`移除成员 (${staff.nickName})`] : [`移除管理员 (${staff.nickName})`,`移除成员 (${staff.nickName})`]
    const userTypeAction = userType == 'staff' ? 'addAdmin' : 'removeAdmin'
    const deleteUserType = userType == 'staff' ? 'deleteStaff' : 'deleteAdmin'
    wx.showActionSheet({
      itemList: itemList,
      success: (res) =>{
        if (!res.cancel) {
          switch (res.tapIndex) {
            case 0:
              this.modifyUserType(staff._id,userTypeAction)
              break;
            case 1:
              this.deleteStaff(staff._id,deleteUserType)
              break;
            default:
              break;
          }
        }
      }
    });
  },
  // adminActionSheet(staff){
  //   wx.showActionSheet({
  //     itemList: [`移除管理员 (${staff.nickName})`,`移除成员 (${staff.nickName})`],
  //     success: (res) =>{
  //       if (!res.cancel) {
  //         switch (res.tapIndex) {
  //           case 0:
  //             this.modifyUserType(staff._id,'removeAdmin')
  //             break;
  //           case 1:
  //             // this.removeStaff(markets[selectedMarket].staffsInfo[index]._id)
  //             break;
  //           default:
  //             break;
  //         }
  //       }
  //     }
  //   });
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // async getMarketStaffsInfo(){
  //   const {markets,selectedMarket} = this.data
  //   const market = markets[selectedMarket]
  //   const curUser = wx.getStorageSync('userInfo')
  //   this.setData({ usertype: market.owner === curUser._id ? 0 : market.admin?.includes(curUser._id) ? 1 : 2 });
  //   if(!market.staffsInfo){
  //     try{
  //       const res = await wx.cloud.callFunction({
  //         name: "groupBuyFunctions",
  //         data:{
  //          type: 'getMarketUser',
  //          marketID: market._id
  //         }
  //       })
  //       markets[selectedMarket] = res.result
  //       this.setData({
  //         markets: markets
  //       })
  //     }catch(err) {
  //       console.error(err);
  //       errorModal(err.message);
  //     } 
  //   }
  // },
//   async handleMarketChange(e){
//     this.setData({
//       selectedMarket: e.detail.value
//     })
//     try{
//       wx.showLoading({
//         title: '加载中...',
//       })
//       await this.getMarketStaffsInfo()
//     }catch(err){
//       console.log(err)
//       errorModal(err.message)
//     }finally{
//       wx.hideLoading()
//     }
//   },
//   handleMangeStaff(e){
//     const index = e.currentTarget.dataset.index;
//     this.data.usertype === 0 ? this.ownerActionSheet(index) : noCancelModal("请重新加载页面")
//   },
//   handleMangeAdmin(e){
//     const index = e.currentTarget.dataset.index;
//     this.data.usertype === 0 ? this.handleAdminActionSheet(index) : noCancelModal("请重新加载页面")
//   },
//  ownerActionSheet(index){
//     const {markets,selectedMarket} = this.data
//     const selectedUser = markets[selectedMarket].staffsInfo[index]
//     wx.showActionSheet({
//       itemList: [`设为管理员 (${selectedUser.nickName})`,`移除成员 (${selectedUser.nickName})`],
//       success: (res) =>{
//         if (!res.cancel) {
//           switch (res.tapIndex) {
//             case 0:
//               this.addAdmin(markets[selectedMarket]._id,markets[selectedMarket].staffsInfo[index]._id)
//               break;
//             case 1:
//               this.removeStaff(markets[selectedMarket].staffsInfo[index]._id)
//               break;
//             default:
//               break;
//           }
//         }
//       }
//     });
//   },
//   handleAdminActionSheet(index){
//     const {markets,selectedMarket} = this.data
//     const selectedUser = markets[selectedMarket].staffsInfo[index]
//     wx.showActionSheet({
//       itemList: [`移除管理员 (${selectedUser.nickName})`,`移除成员 (${selectedUser.nickName})`],
//       success: (res) =>{
//         if (!res.cancel) {
//           switch (res.tapIndex) {
//             case 0:
//               this.removeAdmin(markets[selectedMarket].staffsInfo[index]._id,"removeAdmin")
//               break;
//             case 1:
//               this.removeAdmin(markets[selectedMarket].staffsInfo[index]._id,"deleteAdmin")
//               break;
//             default:
//               break;
//           }
//         }
//       }
//     });
//   },
//   async addAdmin(marketID,userID){
//     wx.showLoading({
//       title: '加载中...',
//     })
//     try{
//       await wx.cloud.callFunction({
//         name: 'groupBuyFunctions',
//         data: {
//           type: 'addAdmin',
//           marketID: marketID,
//           userID: userID
//         }
//       })
//       const {markets,selectedMarket} = this.data
//       markets[selectedMarket].admin = markets[this.data.selectedMarket].admin || [];
//       markets[selectedMarket].admin.push(userID);
//       this.setData({ markets });
//       wx.showToast({
//         title: '添加管理员成功',
//       })
//     }catch(err){
//       console.log(err)
//       errorModal(err.message)
//     }finally{
//       wx.hideLoading()
//     }
//   },
//   async removeStaff(userID){
//     try{
//       wx.showLoading({
//         title: '加载中...',
//       })
//       let {markets,selectedMarket} = this.data  
//       await wx.cloud.callFunction({
//         name: 'groupBuyFunctions',
//         data:{
//           type: 'deleteMarketUser',
//           userID: userID,
//           marketID: markets[selectedMarket]._id
//         }
//       })
//       markets[selectedMarket].staffs = markets[selectedMarket].staffs.filter(staff=>{ return staff != userID;})
//       markets[selectedMarket].staffsInfo = markets[selectedMarket].staffsInfo.filter(staff=>{return staff._id != userID})
//       this.setData({markets:markets})
//       noCancelModal("移除成功")
//     }catch(err){
//       console.log(err)
//       errorModal(err.message)
//     }finally{
//       wx.hideLoading()

//     }
//   },
//   async removeAdmin(userID,type){
//     try{
//       wx.showLoading({
//         title: '加载中...',
//       })
//       let {markets,selectedMarket} = this.data  
//       await wx.cloud.callFunction({
//         name: 'groupBuyFunctions',
//         data:{
//           type: 'removeAdmin',
//           userID: userID,
//           marketID: markets[selectedMarket]._id,
//           action: type
//         }
//       })
//       if (type == 'removeAdmin'){
//         markets[selectedMarket].admin = markets[selectedMarket].admin.filter(admin=>{
//            return admin!= userID
//         })
//       }else if(type == 'deleteAdmin'){
//         markets[selectedMarket].admin = markets[selectedMarket].admin.filter(admin=>{return admin!= userID})
//         markets[selectedMarket].staffsInfo = markets[selectedMarket].staffsInfo.filter(staff=>{return staff._id != userID})
//       }else{
//         console.log("unknow action type")
//       }
//       this.setData({markets:markets})
//       type == 'removeAdmin' ? noCancelModal('移除管理员成功') : noCancelModal('移除成员成功')
//     }catch(err){
//       console.log(err)
//       errorModal(err.message)
//     }finally{
//       wx.hideLoading()
//     }
//   },

    
//   },

//   async quitMarket(){
//     let curUser = wx.getStorageSync('userInfo')
//     let {markets,selectedMarket} = this.data
//     try{
//       wx.showLoading({
//         title: '加载中...',
//       })
//       if(this.data.usertype == 1){
//         await wx.cloud.callFunction({
//           name: 'groupBuyFunctions',
//           data:{
//             type: 'removeAdmin',
//             userID: curUser._id,
//             marketID: markets[selectedMarket]._id,
//             action: 'deleteAdmin'
//           }
//         })
//       }else{
//         await wx.cloud.callFunction({
//           name: 'groupBuyFunctions',
//           data:{
//             type: 'deleteMarketUser',
//             userID: curUser._id,
//             marketID: markets[selectedMarket]._id
//           }
//         })
//       }

//       let indexToRemove = curUser.markets.indexOf(markets[selectedMarket]);
//       curUser.markets.splice(indexToRemove, 1);
//       eventBus.emit("updateUserInfo",curUser)
//       wx.navigateBack()
//     } catch(err){
//       console.log(err)
//       errorModal(err.message)
//     } finally{
//       wx.hideLoading()
//     }
//   },
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})