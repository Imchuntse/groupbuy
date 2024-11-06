// components/groupBuyTrans/groupBuyTrans.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    trans: {
      type: Array,
      value: []
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
    navigaTran(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('navigate', { index });
    }
  }
})