# bootstrap-select3.js
基于bootstrap的dropdown效果的多选插件，带字母分类

## 效果预览   

![overview](http://oaaq2vqkp.bkt.clouddn.com/bootstrap-select3.jpg)

## 调用方法：
```
<input type="text" class="select3" data-url="xxx"/>
$('.select3').select3()
```  

或者  
```
<input type="text" class="select3"/>
$('.select3').select3({url:'xxx'})
```

## options

必填：

__url__                         
数据源链接

格式：[{ "type": "分类1", "item": [{ "title": "阿巴洲", "value": 1 }, { "title": "北京", "value": 2 }] }, { "type": "分类2", "item": [{ "title": "阿巴洲", "value": 1 }, { "title": "北京", "value": 2 }] }]

选填：

__placeholder__                      
默认：Select,如果input上有placeholder属性值，则取该值
