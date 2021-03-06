export type EventNameType = string | number | symbol
export type EventCallback = (...args: Array<any>) => any
export type ListenStopHandle = () => void

export default class Emitter {
  private eventMap: Map<EventNameType, Array<EventCallback>>
  
  constructor () {
    this.eventMap = new Map()
  }

  public on = (name: EventNameType, callback: EventCallback): ListenStopHandle => {
    if (!this.eventMap.has(name)) {
      this.eventMap.set(name, [])
    }

    const callbackList = this.eventMap.get(name)!
    callbackList.push(callback)

    return () => this.off(name, callback)
  }

  public once = (name: EventNameType, callback: EventCallback): ListenStopHandle => {
    // callback wrapper
    const listener = (...args: Array<any>) => {
      // remove when executed
      this.off(name, listener)
      callback(...args)
    }
    this.on(name, listener)

    return () => this.off(name, listener)
  }

  public emit =  (name: EventNameType, ...args: Array<any>): void => {
    const callbackList = this.eventMap.get(name)
    if (Array.isArray(callbackList)) {
      callbackList.forEach(cb => {
        typeof cb === 'function' && cb(...args)
      })
    }
  }

  public off = (name?: EventNameType, callback? : EventCallback): void => {
    if (!name) {
      // off all
      this.eventMap.clear()
    } else if (typeof callback === 'function') {
      // off callback
      if (this.eventMap.has(name)) {
        const eventList = this.eventMap.get(name)!.filter(v => v !== callback)
        this.eventMap.set(name, eventList)
      }
    } else {
      // off event name list
      this.eventMap.delete(name)
    }
  }
}