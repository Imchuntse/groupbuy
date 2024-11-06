// components/custTranList/custTranList.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    trans:{
      type: Array,
      value:[]
    },
    userType:{
      type: Number,
      value: 2
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlePick(e){
      const tranIndex = e.currentTarget.dataset.tranindex
      const itemsIndex = e.currentTarget.dataset.itemsindex
      const status = e.currentTarget.dataset.status
      this.triggerEvent('handlePick',{tranIndex,itemsIndex,status})
    }
  }
})