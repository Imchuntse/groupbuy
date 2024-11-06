// components/tranDetail/tranDetail.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    trans:{
      type: Array,
      value: []
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
    navigaCustDetail(e){
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('navigaCustDetail', { index });
    },
    handlePick(e){
      const status = e.currentTarget.dataset.status
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('handlePick', { index,status });
    }
  }
})