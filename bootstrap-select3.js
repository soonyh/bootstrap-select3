 /* ========================================================================
  * Select3:
  * 基于bootstrap的dropdown效果的多选插件，带字母分类 *
  * https://github.com/soonyh/bootstrap-select3/
  * ========================================================================
  * 调用方法：
  * <input type="text" class="select3" data-url="xxx"/>
  * $('.select3').select3()
  *
  * 或者
  * <input type="text" class="select3"/>
  * $('.select3').select3({url:'xxx'})
  *
  * options：
  * 必填：
  * url:""                           链接，数据源
  *                                  格式：[{ "type": "分类1", "item": [{ "title": "阿巴洲", "value": 1 }, { "title": "北京", "value": 2 }] }, { "type": "分类2", "item": [{ "title": "阿巴洲", "value": 1 }, { "title": "北京", "value": 2 }] }]
  *
  * 选填：
  * placeholder                      默认：Select,如果input上有placeholder属性值，则取该值
  * ======================================================================== */
 ;
 (function(Jquery, window, document, undefined) {
     var pluginName = "select3",
         defaults = {
             "url": "", //数据来源
             "placeholder": "Select",
         },
         instance, //单个实例对象
         instances = []; //存储多个实例多选
     function _getUniqueID(prefix) {
         return prefix + '_' + Math.floor(Math.random() * (new Date()).getTime());
     };
     // 构造函数
     function Plugin(element, options) {
         this.element = element;
         // 将默认属性对象和传递的参数对象合并到第一个空对象中
         this.settings = Jquery.extend({}, defaults, options, $(element).data());
         this._defaults = defaults;
         this._name = pluginName;
         this.loaded = false;
         this.init();
     };
     // 对构造函数的一个轻量级封装，
     // 防止产生多个实例
     Jquery.fn[pluginName] = function(options) {
         this.each(function() {
             instance = Jquery.data(this, "plugin_" + pluginName);
             if (!instance) {
                 Jquery.data(this, "plugin_" + pluginName, (instance = new Plugin(this, options)));
             }
             instances.push(instance);
         });
         // 方便链式调用
         return this;
     };
     // 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
     Jquery.extend(Plugin.prototype, {
         init: function() {
             //清空input的值，因为input会保留上一次操作的值
             $(this.element).val('');             
             this.settings.placeholder = $(this.element).attr('placeholder')?$(this.element).attr('placeholder'):this.settings.placeholder
             this.$container = $('<div>').addClass('select3-container form-control').css("width", $(this.element).width())
             this.$arrow = $('<span class="select3-arrow"><b></b></span>');
             this.$placeholder = $('<span class="select3-placeholder">' + this.settings.placeholder + '</span>');
             this.$choices = $('<ul class="select3-choices"/>').append(this.$placeholder).append(this.$arrow);
             this.$dropdownContainer = $('<div class="select3-dropdown-container"/>').append('<div class="select3-spinner"/>');
             this.$container.append(this.$choices);
             this.$container.append(this.$dropdownContainer);
             $(this.element).hide().after(this.$container); //隐藏原input，并生成全新的markup
             this.$choices.click(function(e) {
                 dropdown(instances[$('.select3-choices').index(this)])
             });
         },
         ajax: function(url) {
             //没有url 则返回空数组
             //sourceData用来保存服务器返回的数据
             var that = this;
             if (url == '') {
                 that.sourceData = [];
                 return;
             }
             $.ajax({
                 url: url,
                 type: 'get',
                 dataType: 'json',
                 async: false, //非异步，否则dropdown时会报错
                 data: {},
             }).done(function(data) {
                 that.sourceData = data;
                 that.loaded = true;
             })
         },
         //点击dropdown里面的a标签时，往input里写入对应的值
         write: function(el) {
             if (!$(el).hasClass('active')) {
                 var that = this;
                 $(el).addClass('active');
                 var text = $(el).text(),
                     id = $(el).attr('id'),
                     $choiceLi = $('<li class="select3-search-choice"/>'),
                     $btnClose = $('<a class="select3-search-choice-close" href="javascript:void(0);"/>');
                 $('<div/>').html(text).appendTo($choiceLi);
                 $(this.element).val()
                 $btnClose.attr('data-index', id).bind('click', function(e) {
                     //阻止冒泡，避免误触发了它的父元素ul.select3-choices身上的绑定事件
                     e.stopImmediatePropagation();
                     that.remove(this)
                 }).appendTo($choiceLi);
                 //在写入li之前判断是否已存在选中项
                 if (this.$choices.children('li.select3-search-choice').size() == 0) {
                     this.$choices.children('.select3-placeholder').remove();
                 }
                 this.$choices.append($choiceLi);
                 this.setValue();
             }
         },
         //点击删除按钮，清楚选项，并更新input里的值
         remove: function(el) {
             $('#' + $(el).data('index')).removeClass('active');
             $(el).closest('.select3-search-choice').remove();
             if (this.$choices.children('li.select3-search-choice').size() == 0) {
                 this.$choices.append(this.$placeholder);
             }
             this.setValue();
         },
         //把以逗号间隔的字符串，保存在input上
         setValue: function() {
             var arr = []
             $(this.$dropdownContainer).find('a.active').each(function() {
                 arr.push($(this).data('value'))
             });
             $(this.element).val(arr.join(','));
             console.log('当前input值：%s', $(this.element).val())
         }
     });
     /**
      * 负责下拉菜单的展示与收缩
      * @param  {[type]} context [为当前的实例对象]
      */
     function dropdown(context) {
         if (context.loaded == false) {
             context.$nav = $('<ul class="nav nav-tabs"/>');
             context.$tabContent = $('<div class="tab-content"/>');
             context.ajax(context.settings.url);
             $.each(context.sourceData, function(index, value) {
                 //nav li
                 var _id = _getUniqueID('tab'); //tab id
                 var _a = $('<a>').attr({
                     'href': '#' + _id,
                     'data-toggle': 'tab'
                 }).append(value.type); //写上分类名
                 var _li = $('<li>').append(_a);
                 context.$nav.append(_li);
                 // tab-pane
                 var _div = $('<div>').attr({
                     'id': _id,
                     'class': 'tab-pane'
                 });
                 $.each(value.choices, function(index, value) {
                     var _oprItem = $('<div>').addClass('opr-item');
                     var letter = $('<span>').addClass('opr-item-letter').html(value.letter);
                     _oprItem.append(letter);
                     $.each(value.oprItems, function(index, value) {
                         var _id = _getUniqueID('choice');
                         var _a = $('<a>').attr({
                             'href': 'javascript:void(0);',
                             'id': _id,
                             'data-value': value.value
                         }).append(value.title).bind('click', function() {
                             context.write(this)
                         });
                         _oprItem.append(_a);
                     })
                     _div.append(_oprItem);
                 });
                 context.$tabContent.append(_div);
             })
             context.$dropdownContainer.find('.select3-spinner').remove();
             context.$dropdownContainer.append(context.$nav);
             context.$dropdownContainer.append(context.$tabContent);
         }
         context.$container.toggleClass('open');
         context.$nav.children('li:first').addClass('active');
         context.$tabContent.children('.tab-pane:first').addClass('active');
     };
     //点击select3之外的地方，自动收起dropdown
     $(document).on('click', function(e) {
         if ($('.select3-container.open').size() == 0) {
             return
         }
         //获得当前展开的dropdown在所有实例中的索引
         var index = $('.select3-container').index($('.select3-container.open'))
             //$.contains()方法 对本身和绝对定位的子元素，判断无效，所以应该额外排除         
             //关闭按钮和下拉图标,物理位置是在div.select3-container内，但是position:absolute，是绝对定位。
             //点击div.select3-container自身也要排除
         if (!$.contains(instances[index]['$container'][0], e.target) && e.target.className != 'select3-search-choice-close' && e.target.className != 'select3-container form-control open' && e.target.localName != 'b') {
             $('.select3-container').removeClass('open')
         }
     });
 })(jQuery, window, document);
