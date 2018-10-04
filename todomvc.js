//存储数据部分
const STORAGE_KEY = 'todos-vuejs-2.0'
var todoStorage = {
  fetch: () => {
  	console.log('fetch succeed')
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    todos.forEach(function (todo, index) {//防止出现index重复的现象
      todo.id = index;
    })
    todoStorage.uid = todos.length;
    return todos;
  },
  save: (todos) => {
    console.log('save succeed')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

//筛选部分
var filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter(todo => !todo.completed), //筛选出未完成的
  completed: (todos) => todos.filter(todo => todo.completed), //筛选出已完成的
}

//监听hash值变化
window.addEventListener('hashchange',function(e){
	console.log(e);
  console.log(window.location.hash);
  var visibility = window.location.hash.replace(/#\//, '');
  console.log(visibility);
  app.visibility = visibility;
})

//hash函数要获取到Vue实例
var app = new Vue({
  data: {
    todos: todoStorage.fetch(),
    newTodo:'',//添加输入框输入的内容
    visibility:'all',//控制显示的内容
    editedTodo:null, //处于编辑状态的todo
    beforeEditCache:''//编辑之前缓存的title
  },
  
  //监听todos变化，变化则存起来
  watch:{
  	todos:{
    	handler:function(newtodos){
      	todoStorage.save(newtodos);
      },
      deep:true //监听内部变化
    }
	},
  
  //单复数转化过滤器
  filters:{
  	pluralize:function(n){
    	return n === 1 ? 'item' : 'items';
    }
	},
  
  //相关计算属性
  computed:{
  	remaining:function(){//返回剩余未完成todo的数量
    	return filters.active(this.todos).length;
    },
    allDone:{//全选开关的计算属性
    	get:function(){//全部todo完成时为true
      	return this.remaining===0;
      },
      set:function(val){//全选或者全不选
      	this.todos.forEach(todo=>{
        	todo.completed = val;
        })
      }
    },
    filteredTodos:function(){//返回要显示的内容
    	return filters[this.visibility](this.todos);
    }
  },
  
  methods:{
  	//添加todo
  	addTodo:function(){
      var value = this.newTodo && this.newTodo.trim();
    	if(!value){
      	return
      }
      this.todos.push({
      	id:todoStorage.uid++,//先赋值再增加
        title:value,
        completed:false
      })
      this.newTodo = '';
    },
    
    //删除todo
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
    
    //编辑todo
    editTodo:function(todo){
    	this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
    
    //完成编辑
    doneEdit:function(todo){
    	this.editedTodo = null;
      todo.title = todo.title.trim();
      if(!todo.title){
      	this.removeTodo(todo);
      }
    },
    
    //取消编辑
    cancelEdit: function (todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },
    
    //删除全部已完成todo
    removeCompleted: function(){
    	this.todos = filters['active'](this.todos);
    }
    
  },
  
  //自定义聚焦指令，使得双击todo后聚焦到input上
  directives:{
  	'todo-focus':function(el,binding){
    	if(binding.value){//value对应的html中传入的todo == editedTodo对应的值
      	el.focus();
      }
    }
  }
  
})

app.$mount('#app');


