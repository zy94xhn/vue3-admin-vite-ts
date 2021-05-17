import { localStoreApi } from "@store/localStore/local";
import { defineComponent,nextTick,onMounted,reactive,ref } from "vue";
/**
 * 
 * @param {Number} maxWidth 最大宽度
 * @param {Number} minWidth 最小宽度
 * @param {String} leftTitle 左标题
 * @param {String} rightTitle 右标题？
 * @param {Boolean} sotoreage 是否存储与localstorege
 */
const splitPane= defineComponent({
  name:"splitPane",
  props:{
    maxWidth:Number,
    minWidth:Number,
    leftTitle:String,
    rightTitle:String,
    sotoreage:Boolean
  },
  emits:["drug","drugend","load","resize"],
  setup(props,ctx) {
    const basePosition = reactive({
      pageX: 0,
      pageY: 0,
    });
    const title = ref("")
    const getTitle = ()=>{
      return props.leftTitle ?? ""
    }
    const setTitle = (str:string) =>{
      title.value = str
    }
    ctx.expose({
      setTitle
    })
    title.value = getTitle();
    let  mo:any;
    const store = new localStoreApi()
    const setStore = (val) =>{
      if(props.sotoreage){
        store.set("split-width",val)
      }
    }
    onMounted(()=>{     
      nextTick(()=>{
        ctx.emit("load",ctx)
        MutationObserver = window.MutationObserver;
        if (MutationObserver) {
          /* 监听浏览器的窗口变化，在部分情况下需要这个api */
          mo = new MutationObserver(function() {
            const __wm = document.querySelector("#rezie-id");            
            // 只在__wm元素变动才重新调用 __canvasWM
            if (!__wm) {
              console.log("被处罚");
              // 避免一直触发
              mo.disconnect();
              mo = null;
              ctx.emit("resize")
            }
          });
          mo.observe(document.querySelector("#rezie-id"), {
            attributes: true,
            subtree: true,
            childList: true,
          });
        }
      }) 
    })
    const hnadleMouseDown = (evt: MouseEvent) => {
      let {pageX,pageY} = evt
      basePosition.pageX = pageX
      basePosition.pageY = pageY
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
    const handleMouseMove = evt => {
      evt.//阻止默认事件
      //preventDefault()[dom标准写法(ie678不兼容)]
      //ie678用returnValue
      //或者利用return false也能阻止默认行为,没有兼容问题(只限传统注册方式)
      preventDefault()
      let {pageX} = evt
      const baseDiv = document.querySelector(".right-border-shadow")
      let baseWidth:Number | undefined = 374+pageX-basePosition.pageX
      baseWidth = (baseWidth > Number(props?.maxWidth)) ? props.maxWidth :baseWidth
      baseWidth = (Number(baseWidth) < Number(props?.minWidth)) ? props.minWidth :baseWidth
      baseDiv?.setAttribute("style",`width:${baseWidth}px`)
    };
    const handleMouseUp = evt => {
      const width = document.querySelector(".right-border-shadow")?.clientWidth
      setStore(width)      
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      ctx.emit("drugend")
    };
    return () => (
      <div id="rezie-id" class="w-full h-full flex">
        <div class={"flex flex-col right-border-shadow transition-all duration-150"} style={`width:${store.get("split-width")?store.get("split-width"):props.minWidth?props.minWidth:384}px`}>
          <div class="w-full text-center py-4 text-xl text-gray-600 h-20">
            {title.value}
          </div>
          <div class="flex-1">
            {
              ctx.slots.leftContet && ctx.slots.leftContet()
            }
          </div>
        </div>
        <div
          id="line"
          class="w-2 cursor-move"
          onMousedown={hnadleMouseDown}
        ></div>
        <div class="flex-1 h-full overflow-hidden">
          {
             ctx.slots.rightContent && ctx.slots.rightContent()
          }
        </div>
      </div>
    );
  }
})
export default splitPane