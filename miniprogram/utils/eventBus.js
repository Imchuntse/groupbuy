class EventBus{
  constructor(){
    this.events = {}
  }
  on(event,listener){
    if(!this.events[event]){
      this.events[event] = []
    }
    this.events[event].push(listener)
  }
  off(event,listener){
    if(!this.events[event]){
      return
    }
    this.events[event] = this.events[event].filter( l=> l!== listener)
  }
  emit(event,data){
    if(!this.events[event]) return
    this.events[event].map(listener => listener(data))
  }
}

const eventBus = new EventBus()
module.exports = eventBus
