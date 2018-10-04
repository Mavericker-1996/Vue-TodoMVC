# TodoMVC Example

[参考文章](https://blog.csdn.net/caspernan/article/details/78244110)

## 关于TodoMVC

官方介绍如下：

> Developers these days are spoiled with choice when it comes to [selecting](http://coding.smashingmagazine.com/2012/07/27/journey-through-the-javascript-mvc-jungle/) an **MV\* framework** for structuring and organizing their JavaScript web apps.
>
> Backbone, Ember, AngularJS… the list of new and stable solutions continues to grow, but just how do you decide on which to use in a sea of so many options?
>
> To help solve this problem, we created [TodoMVC](https://github.com/tastejs/todomvc) - a project which offers the same Todo application implemented using MV* concepts in most of the popular JavaScript MV* frameworks of today.

简单来说就是一个Google团队发起的一个项目，目的是让世面上众多框架实现一个相同的`TodoList`demo。好让初学者进行技术选型。

## 功能要求

1. 点击输入框，输入内容，按下回车键就会在下面增加一项todo
2. 鼠标悬浮到一条todo时，右边会显示x删除图标，点击即可进行删除，左边会显示完成图标，点击即添加到完成列表中。
3. 双击一条todo可以对其进行编辑，按回车键完成编辑。
4. 可以查看已完成的todo和未完成的todo
5. 可以全部选中，进行清空，切换状态操作

## 代码实现

### 存储数据部分

我们通过localStorage对todolist进行存储，其中每一项包含的属性有`id`，内容`title`，是否已完成`completed`。这里我们封装一个`todoStorage`对象，里面包含了两个方法：`fetch`和`save`。

在`fetch`方法中我们首先通过`getItem`方法获得todos，由于`setItem`函数接受的两个参数都是字符串，所以需要使用`JSON.parse`和`JSON.stringify`两个函数进行转化。然后为了防止出现id重复的现象，我们需要在每次获取todos的时候对其中的id进行按index赋值，然后通过一个`uid`参数来记录其长度，之后添加的时候id赋值为uid++即可。最后我们将todos返回。

在`save`方法中我们通过`setItem`方法对其进行存储即可。

```javascript
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
```

### 筛选部分

为了方便调用，我们封装了一个`filters`对象对要显示的todos进行管理，其中包括三个方法：`all`，`active`，`completed`。分别对应筛选这三个状态的todos。

```javascript
//筛选部分
var filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter(todo => !todo.completed), //筛选出未完成的
  completed: (todos) => todos.filter(todo => todo.completed), //筛选出已完成的
}
```

### Vue实例部分

由于Vue实例中一些内容不知在哪里写，就在这里先写一部分。首先我们要用一个变量`app`来代码Vue实例，这个之后在监听`hashchange`事件会用到。

对于实例中的data，在这里也全部列出，后面有每一个变量的作用。

```javascript
  data: {
    todos: todoStorage.fetch(),
    newTodo:'',//添加输入框输入的内容
    visibility:'all',//控制显示的内容
    editedTodo:null, //处于编辑状态的todo
    beforeEditCache:''//编辑之前缓存的title
  },
```

然后我们需要在`watch`接口中监听todos这个变量,当发现它变化的时候，我们就调用`todoStorage.save()`函数将其存储起来。

```javascript
  //监听todos变化，变化则存起来
  watch:{
  	todos:{
    	handler:function(newtodos){
      	todoStorage.save(newtodos);
      },
      deep:true //监听内部变化
    }
	},
```

然后需要一个过滤器`filters`来处理接下来显示`item`的单复数问题，关于filters的使用，可以参考[这里](https://cn.vuejs.org/v2/guide/filters.html)。

```javascript
  //单复数转化过滤器
  filters:{
  	pluralize:function(n){
    	return n === 1 ? 'item' : 'items';
    }
	},
```

接下来我们需要设置一些计算属性来满足我们的需求：关于计算属性的使用，可以参考[这里](https://cn.vuejs.org/v2/guide/computed.html)。

1. remaining：用来返回剩余未完成todo的数量。
2. allDone：用来绑定全选开关的计算属性，它有一个`get`函数和`set`函数，对于`get`函数，它返回的是是否全部todo已经完成。对于`set`函数，它是当我们手动操作这个开关对allDone进行赋值时我们将所有todo进行全部完成和全部待完成的操作，即将每一项todo中completed的值设为与allDone相同的值。
3. filteredTodos：用来返回我们要显示的todo列表，根据当前的`visibility`我们调用`filters`这个对象中的方法进行筛选。

```javascript
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
```

在后面的双击todo进行编辑的时候，我们需要实现一个自定义指令使其双击后聚焦到编辑输入框上，我们通过editedTodo是否等于当前的todo进行判断是否发生了双击事件，关于自定义指令的使用，可以参考[这里](https://cn.vuejs.org/v2/guide/custom-directive.html)。

```javascript
  //自定义聚焦指令，使得双击todo后聚焦到input上
  directives:{
  	'todo-focus':function(el,binding){
    	if(binding.value){//value对应的html中传入的todo == editedTodo对应的值
      	el.focus();
      }
    }
  }
```

### 添加新todo部分

对于界面中的输入框部分，我们通过`v-model`为其绑定了一个变量`newTodo`来代表输入的内容。同时为其绑定了一个按下键盘`enter`的事件。在这个事件中我们执行添加新todo操作。HTML代码如下：

```html
  <header class='header'>
    <div class='title'>todos</div>
    <input class='newtodo' 
           placeholder="What needs to be done?" 
           autocomplete='off' 
           v-model='newTodo' 
           @keyup.enter='addTodo'>
  </header>
```

然后我们需要一个在输入框的左边放一个全选按钮，类型是checkbox，这时我们需要通过`v-model`为其绑定一个计算属性`allDone`。对于键盘`enter`事件绑定的添加函数，我们先需要对其进行`trim()`操作过滤掉两边多余的空格，然后将值push到todos数组里面去，并带上相应的id和completed值（统一设为false）。

```javascript
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
```

### 显示todo列表部分

这个部分相对比较复杂，也是这个项目中的核心部分，首先我们用`<ul>`标签来存储todo列表，用`<li>`标签来存储todo列表中的每一项。在`<li>`标签中我们通过`v-for`对`filteredTodos`返回的内容进行遍历，同时要根据每一项的completed属性和是否处在编辑状态（根据editedTodo是否等于当前的todo进行判断）来绑定不同的class。

```html
    <ul class='todo-list'>
      <li class='todo' 
          v-for='todo in filteredTodos' 
          :key='todo.id'
          :class='{completed:todo.completed,editing:todo==editedTodo}'>
```

接下来我们来说每个`<li>`标签里面的内容：

首先左边有一个切换状态的按钮，类型为checkbox，我们通过`v-model`将其绑定在每一个todo的completed属性上。

接着中间显示内容，我们需要为其绑定一个`dblclick`双击事件，双击后对其进行编辑。

最后右边有一个删除按钮，点击执行删除操作。

然后当双击一个todo后处于编辑状态的时候，我们需要一个input输入框，对其进行编辑。对于这个编辑输入框：

1. 我们需要通过`v-model`将其绑定到每一个todo的title属性上。
2. 为其绑定`v-todo-focus`自动聚焦指令。
3. 当失去焦点(blur)和按下`enter`键的时候，绑定完成编辑函数。
4. 当按下`esc`键的时候，绑定取消编辑函数。所以之前要通过一个变量将之前的title值存起来。

```html
          <!--正常状态显示的view-->          
          <div class='view'>
            <!--左边切换状态按钮-->
            <input class='toggle' type='checkbox' v-model='todo.completed'>
            <!--中间todo内容-->
            <label @dblclick='editTodo(todo)'>{{todo.title}}</label>
            <!--右边删除按钮-->
            <button class='delete' @click='removeTodo(todo)'></button>
          </div>    
          
          <!--编辑状态状态显示的input-->
          <input class='edit' type='text'
            v-model='todo.title'
            v-todo-focus="todo == editedTodo"
            @blur='doneEdit(todo)'
            @keyup.enter='doneEdit(todo)'
            @keyup.esc='cancelEdit(todo)'>       
      </li>
    </ul>
```

对于删除todo函数，我们在todos中删除对应的todo即可。

```javascript
    //删除todo
    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
```

对于编辑todo函数，我们先将当前的title值存起来，然后将editedTodo赋值为todo。

```javascript
    //编辑todo
    editTodo:function(todo){
    	this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
```

对于完成编辑函数，我们先将editedTodo赋值为null释放出来，然后再判断编辑后的内容trim()后是否还有内容，否则就remove掉即可。

```javascript
    //完成编辑
    doneEdit:function(todo){
    	this.editedTodo = null;
      todo.title = todo.title.trim();
      if(!todo.title){
      	this.removeTodo(todo);
      }
    },
```

对于取消编辑函数，我们先将editedTodo赋值为null释放出来，然后将之前缓存的title值赋过去即可。

```javascript
    //取消编辑
    cancelEdit: function (todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },
```

### 筛选按钮组部分

对于这一部分，我们采用`<a>`标签来模拟按钮操作，之所以这样是因为我们可以在href中设置不同的hash值来进行传参，即携带不同的visibility的值，然后通过`onhashchange`事件进行捕获参数进行相应的赋值操作，visibility值变化则使computed中的filteredTodos函数返回值变化,则实现切换任务状态可见。关于hash的介绍，可以参考[这里](https://www.cnblogs.com/carriezhao/p/6861319.html)。

```html
  <!--按钮部分-->
      <ul class='filters'>
        <li><a href="#/all" :class="{ selected: visibility == 'all' }">All</a></li>
        <li><a href="#/active" :class="{ selected: visibility == 'active' }">Active</a></li>
        <li><a href="#/completed" :class="{ selected: visibility == 'completed' }">Completed</a></li>
      </ul>
 <!--清空所有已完成todo，即当todos.length-remaining>0的时候-->
      <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
        Clear completed
      </button>
```

```javascript
//监听hash值变化
window.addEventListener('hashchange',function(e){
	console.log(e);
  console.log(window.location.hash);
  var visibility = window.location.hash.replace(/#\//, '');
  console.log(visibility);
  app.visibility = visibility;
})
```

对于清楚所有已完成的todo，我们只需将当前的todos设为所有未完成的todo即可。

```javascript
    //删除全部已完成todo
    removeCompleted: function(){
    	this.todos = filters['active'](this.todos);
    }
```

## 总结

通过本demo使我对vue的相关掌握更加熟练，包括之前没有用过的一些像自定义指令，过滤器的内容，不得不佩服官方的源码写的很简洁漂亮，还是要多看好代码，多模仿，多实践。