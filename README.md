## Update
1. 修复首页第三幅图片未正确载入的问题
2. inline CSS, 消除CRP阻塞

## 项目优化解释
#### 配置gulp工作流
配置文件从以前的项目中复制过来，内容不完全懂，不过努力配置成本项目可用的工作流
>最小化html，css，js；ngrok服务器；等

#### 构建工程目录
1. 开发应用放在app/路径下
2. 将views文件夹中的文件移动到app/根目录下对应的位置
3. 新建dist/路径，存放编译好的应用
#### 图片本地化
下载几个本来是url链接的图片，放在本地
#### pagespeed insight测试
主要目的是让google帮助压缩图片，图片放在dist/img/下
#### 优化main.js
1. 删除main.js中的determineDx函数，避免改变披萨尺寸时的强制同步布局
2. 修复披萨滑窗在chrome canary浏览器中无效的bug
3. 将创建100个pizza的代码移动到DOMContentLoaded事件中

#### pagespeed insight 优化
1. Leverage browser caching，尝试后，放弃，这个应该在服务器端配置
2. Enable compression，尝试后，放弃使用gzip压缩文件
3. Reduce server response time，不会
4. Render-blcoking, 将pizza的style写成inline css；`对bootstrap没辙`
#### 最后：没有达到90分，望审阅老师赐教
