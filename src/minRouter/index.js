// 用于保存vue的构造函数，方便在类中使用
let Vue = null;

class VueRouter {
  constructor(options) {
    // 拿到路由映射表，挂载到·vueRouter的实例上
    this.routes = options.routes || [];

    // 保存当前的url(hash或者history)用于记录url的变化去渲染对应的组件
    // 但是组件的render函数在正常情况下值渲染一次，显然router-view需要根据url的变化去不断render进行更新，所有current需要是一个响应式数据，一旦current发生变化对应的router-view的render就需要重新执行
    // Vue.util.defineReactive是vue的一个隐藏api用于给指定对象定义响应式属性，当响应式的属性发生变化时，依赖于改属性的组件就会重新渲染
    // 注意：defineReactive只能给对象定义响应式属性，不能给基本数据类型定义响应式属性，第一个参数是对象，第二个参数是需要响应的属性名，第三个为属性的初始值
    Vue.util.defineReactive(
      this,
      "current",
      window.location.hash.slice(1) || "/"
    );

    // 监控hashChange
    window.addEventListener("hashchange", () => {
      const url = window.location.hash.slice(1); // 去除hash中的#
      this.current = url;
    });
  }
}

/**
 * 实现一个install的静态方法，用于注册VueRouter插件
 * @param {*} _Vue 是在Vue.use中vue传入的第一个形参，为vue的构造函数
 */
VueRouter.install = function (_Vue) {
  Vue = _Vue;

  //   1. 在vue的实例上注册$router
  //   因为Vue.use(VueRouter)会在new Vue()之前执行，所有此时尚不存在vue实例，因此必须在vue实例生成之后再执行注册$router的代码
  // 可以借助mixin，vue的mixin会在new Vue之后执行
  Vue.mixin({
    beforeCreate() {
      //   在vue的实例上可以访问到new Vue(options)时，传入的options；而创建vue实例时，传入了router，借此可以拿到vue-router实例
      if (this.$options.router) {
        //   只有在根实例上才会有router属性，所以只有在new Router时会执行一次这个注册
        // 注册完毕之后，所有的组件就都可以使用this.$router
        Vue.prototype.$router = this.$options.router;
      }
    },
  });

  //  2. 注册vue-router的两个全局组件，分别为router-views,router-link
  Vue.component("router-link", {
    // 声明组件的属性
    props: {
      to: {
        type: String,
        require: true,
      },
    },
    /**
     * 当前的版本是vue.runtime.js是一个运行时版本，没有解释器，所以只能使用render函数
     * 假如是vue.js版本，那么可以使用template模板
     * @param {*} h h函数就是createElement(),用于返回一个虚拟Dom
     * @returns 虚拟Dom
     */
    render(h) {
      // 正常使用router-link时，是以<router-link to="/about">跳转名称</router-link>
      // 以上使用方法,渲染的dom文本内容就等同于一个插槽,render函数this指向vue实例
      //   return h("a", "router-link");
      return h(
        "a",
        {
          attrs: {
            href: "#" + this.to,
          },
        },
        this.$slots.default
      );
    },
  });
  Vue.component("router-view", {
    render(h) {
      // h函数可以直接传入一个组件，那么就会渲染这个组件
      // 因此，如果能拿到当前url的变化部分，根据我们的路由映射表去拿到当前路由对应的组件，那么就可以直接传入这个组件，实现router-view的占位符匹配显示对应组件的功能
      console.log(this.$router, "+++");
      let component = null;
      // 路由映射表
      const routes = this.$router.routes;
      const route = routes.find((route) => route.path === this.$router.current);

      if (route) component = route.component;
      return h(component);
    },
  });
};

console.log(Vue);

export default VueRouter;
