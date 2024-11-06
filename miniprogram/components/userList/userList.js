// components/userList/userList.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    users:{
      type: Array,
      value: []
    },
    userType: {
      type:Number,
      value: 2
    },
    icon:{
      type:Number,
      value: 0
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
    handleTap(e) {
      if(this.data.userType == 0 && this.data.icon == 0){
        const index = e.currentTarget.dataset.index;
        this.triggerEvent('modifyStaff', {index})
      }
      
    },
    handleIconTap(e){
      if(this.data.userType == 0 && this.data.icon == 1){
        const index = e.currentTarget.dataset.index;
        this.triggerEvent('removeStaff', {index})
      }
    }
  }
});