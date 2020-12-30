<template>
  <div>
    <el-menu
      active-text-color="#ffd04b"
      background-color="#545c64"
      class="el-menu-demo"
      mode="horizontal"
      text-color="#fff">
      <el-menu-item @click="login" index="1" v-if="!user">登录</el-menu-item>
      <el-menu-item index="1" v-else>
        <el-dropdown trigger="hover">
          <el-avatar :src="user.pic"></el-avatar>
          <span style="color: #E6A23C" v-text="user.username"></span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="logout" icon="el-icon-remove">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-menu-item>
      <el-submenu index="2">
        <template slot="title">分类</template>
        <el-menu-item :index="category.id" @click="categoryClick(category.id)"
                      v-for="category in categories" v-text="category.name"></el-menu-item>
      </el-submenu>
      <el-menu-item @click="hall" index="3">直播大厅</el-menu-item>
      <el-menu-item index="4">
        <el-input
          placeholder="请输入您要搜索的内容"
          v-model="searchParams.keywords">
        </el-input>
        <i @click="searchClick" class="el-icon-search" style="position: relative; left: -38px; cursor: pointer"></i>
      </el-menu-item>
      <el-menu-item @click="becameAnchor" index="5">成为主播</el-menu-item>
      <el-menu-item @click="start" index="6">开播</el-menu-item>
    </el-menu>

    <!--登录-->
    <el-dialog :close-on-click-modal="false" :visible.sync="loginFormVisible" class="login-dialog" title="登录"
               width="30%">
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm">
        <el-form-item label="手机号" prop="phone">
          <el-input autocomplete="off" v-model="loginForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password"></el-input>
        </el-form-item>
        <el-row>
          <el-col :offset="6">
            <router-link :to="'register'">
              <el-link type="primary">没有账号？</el-link>
            </router-link>
            <router-link :to="'reset'">
              <el-link type="success">忘记密码？</el-link>
            </router-link>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="cancel('loginForm', 'loginFormVisible')">取 消</el-button>
        <el-button @click="submit('loginForm')" type="primary">确 定</el-button>
      </div>
    </el-dialog>

    <!--成为主播-->
    <el-dialog :close-on-click-modal="false" :visible.sync="anchorFormVisible" class="anchor-dialog" title="注册主播"
               width="30%">
      <el-form :model="anchorForm" :rules="anchorRules" ref="anchorForm">
        <el-form-item label="真实姓名" prop="name">
          <el-input autocomplete="off" v-model="anchorForm.name"></el-input>
        </el-form-item>
        <el-form-item label="身份证号码" prop="idCard">
          <el-input type="text" v-model="anchorForm.idCard"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="cancel('anchorForm', 'anchorFormVisible')">取 消</el-button>
        <el-button @click="submit('anchorForm')" type="primary">确 定</el-button>
      </div>
    </el-dialog>

    <!--开播-->
    <el-dialog :close-on-click-modal="false" :visible.sync="startFormVisible" class="start-dialog" title="开播"
               width="30%">
      <el-form :label-position="'left'" :model="startForm" :rules="startRules" ref="startForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="startForm.title"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select clearable placeholder="请选择所属分类" v-model="startForm.category">
            <el-option
              :key="category.id"
              :label="category.name"
              :value="category.id"
              v-for="category in categories">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="cancel('startForm', 'startFormVisible')">取 消</el-button>
        <el-button @click="submit('startForm')" type="primary">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {anchor, getCategory, isLogin, login, logout, startAnchor} from '@/api/NavApi'
  import {
    ANCHOR_MULT_EXCEPTION,
    AUTH_ERROR,
    LOGINED,
    NO_ANCHOR_EXCEPTION,
    OK,
    USER_COOKIE,
    WEBSOCKET_URL
  } from '@/utils/Constant'
  import {CookieUtil} from '@/utils/common'

  export default {
    name: 'Nav',
    data: function () {
      let checkPhone = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入手机号码'))
        } else if (!value.match(/0?(13|14|15|18|17)[0-9]{9}/)) {
          callback(new Error('请输入正确的手机号码!'))
        } else {
          callback()
        }
      }
      let checkPassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (value.length < 8 || value.length > 15) {
            callback(new Error('密码长度必须在8到15位之间'))
          } else {
            callback()
          }
        }
      }

      let checkName = (rule, value, callback) => {
        if (!value) {
          callback(new Error('姓名不能为空'))
        } else {
          if (!value.match(/^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/)) {
            callback(new Error('姓名格式不正确'))
          } else {
            callback()
          }
        }
      }
      let checkId = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入身份证号码'))
        } else {
          if (!value.match(/\d{17}[\d|x]|\d{15}/)) {
            callback(new Error('身份证号码不合法'))
          } else {
            callback()
          }
        }
      }
      let checkTitle = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入标题'))
        } else {
          callback()
        }
      }

      let checkCategory = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请选择分类'))
        } else {
          callback()
        }
      }
      return {
        loginFormVisible: false,
        anchorFormVisible: false,
        startFormVisible: false,
        user: {},
        loginForm: {
          phone: '',
          password: ''
        },
        anchorForm: {
          name: '',
          idCard: ''
        },
        startForm: {
          title: '',
          category: ''
        },
        searchParams: {
          keywords: ''
        },
        categories: [],
        loginRules: {
          phone: [
            {validator: checkPhone, trigger: 'blur'}
          ],
          password: [
            {validator: checkPassword, trigger: 'blur'}
          ]
        },
        anchorRules: {
          name: [
            {validator: checkName, trigger: 'blur'}
          ],
          idCard: [
            {validator: checkId, trigger: 'blur'}
          ]
        },
        startRules: {
          title: [
            {validator: checkTitle, trigger: 'blur'}
          ],
          category: [
            {validator: checkCategory, trigger: 'blur'}
          ]
        },
        queueReceiveSetting: {// 消息队列配置
          websock: null,
          client: null,
          wsuri: WEBSOCKET_URL
        }
      }
    },
    methods: {
      submit: function (form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            if (form === 'loginForm') {
              // 登录表单提交
              login(this.loginForm)
                .then((data) => {
                  let code = data.code
                  if (code === OK) {
                    location.reload()
                  } else if (code === AUTH_ERROR) {
                    this.$message({
                      showClose: true,
                      message: '用户名或者密码错误',
                      type: 'error'
                    })
                  } else if (code === LOGINED) {
                    this.$message({
                      showClose: true,
                      message: '用户已经登录',
                      type: 'error'
                    })
                  } else {
                    this.$message({
                      showClose: true,
                      message: '未知异常',
                      type: 'error'
                    })
                  }
                })
                .catch(e => {
                  console.log(e)
                  this.$message({
                    showClose: true,
                    message: '未知异常',
                    type: 'error'
                  })
                })
            } else if (form === 'anchorForm') {
              // 成为主播
              anchor(this.anchorForm)
                .then(({code}) => {
                  if (code === OK) {
                    this.$message({
                      showClose: true,
                      type: 'info',
                      message: '注册主播成功，正在审核中'
                    })
                    this.cancel('anchorForm', 'anchorFormVisible')
                  } else if (code === ANCHOR_MULT_EXCEPTION) {
                    this.$message({
                      showClose: true,
                      type: 'error',
                      message: '多次提交主播注册，或者已经注册'
                    })
                    this.cancel('anchorForm', 'anchorFormVisible')
                  } else {
                    this.$message({
                      showClose: true,
                      type: 'error',
                      message: '未知异常'
                    })
                  }
                })
                .catch(e => {
                  console.log(e)
                  this.$message({
                    showClose: true,
                    type: 'error',
                    message: '未知异常'
                  })
                })
            } else if (form === 'startForm') {
              // 开播
              startAnchor(this.startForm)
                .then((data) => {
                  let code = data.code
                  if (code === OK) {
                    // 获取流对象
                    let {pushUrl} = data.stream
                    let split = pushUrl.split('?')
                    let index = split[0].lastIndexOf('/')
                    let str1 = split[0].substring(0, index)
                    let str2 = split[0].substring(index + 1)
                    let tipHtml = `<p>服务器：<span style="color: red; font-size: 12px;">${str1}</span></p><p>串流密匙：<span style="color: red;font-size: 12px">${str2 + '?' + split[1]}</span></p>`
                    this.$notify({
                      title: '请复制一下推流地址，使用推流工具开播, 1h有效',
                      message: tipHtml,
                      type: 'info',
                      dangerouslyUseHTMLString: true,
                      duration: 0
                    })
                    this.cancel('startForm', 'startFormVisible')
                  } else if (code === NO_ANCHOR_EXCEPTION) {
                    this.$message({
                      showClose: true,
                      message: '你还不是主播哦，请先注册为主播',
                      type: 'error'
                    })
                  }
                })
                .catch(e => {
                  this.$message({
                    showClose: true,
                    message: '未知异常',
                    type: 'error'
                  })
                })
            }
          } else {
            return false
          }
        })
      },
      cancel (form, visible) {
        this[visible] = false
      },
      login () {
        this.loginFormVisible = true
      },
      async logout () {
        let {code} = await logout()
        console.log(code)
        if (code === OK) {
          // 删除Cookie
          CookieUtil.delCookie(USER_COOKIE)
          // 关闭连接
          this.queueReceiveSetting.websock.close()
          location.reload()
        } else {
          this.$message({
            showClose: true,
            message: '未知异常',
            type: 'error'
          })
        }
      },
      hall () {
        this.$router.push('/')
        location.reload()
      },
      becameAnchor () {
        this.anchorFormVisible = true
      },
      start () {
        this.startFormVisible = true
      },
      initWebSocket () {
        let that = this
        // ws地址
        if (this.queueReceiveSetting.websock) {
          this.queueReceiveSetting.websock.close()
        }
        this.queueReceiveSetting.websock = new WebSocket(this.queueReceiveSetting.wsuri + "3")
        this.queueReceiveSetting.websock.onopen = (res) => {
          console.log('开启连接')
        }
        this.queueReceiveSetting.websock.onmessage = function (res) {
          that.$emit('onmessage', res)
        }
        this.queueReceiveSetting.websock.onclose = function (res) {
          console.log('连接关闭')
        }
        this.queueReceiveSetting.websock.onerror = function (res) {
          console.log('连接出错')
          // this.initWebSocket();
        }
        // 传递数据
        this.$emit('socket', this.queueReceiveSetting)
      },
      categoryClick (id) {
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
        this.$emit('fnc', id)
      },
      searchClick () {
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
        this.$emit('fnc1', this.searchParams.keywords)
      }
    },
    created: async function () {
      // 判断当前是
      let {user} = await isLogin()
      this.user = user
      // 传递user数据
      this.$emit('user', user)
      // 连接webSocket
      this.initWebSocket()
      // 获取分类数据
      let data = await getCategory()
      this.categories = data.categories
      // 获取查询参数
      let keywords = this.$route.query.keywords
      if (keywords) {
        this.searchParams.keywords = keywords
      }
    },
    watch: {
      loginFormVisible (newValue, oldValue) {
        if (!newValue) {
          this.$refs['loginForm'].resetFields()
        }
      },
      anchorFormVisible (newValue, oldValue) {
        if (!newValue) {
          this.$refs['anchorForm'].resetFields()
        }
      },
      startFormVisible (newValue, oldValue) {
        if (!newValue) {
          this.$refs['startForm'].resetFields()
        }
      }
    }
  }
</script>

<style>
  .el-notification {
    width: 780px !important;
  }
</style>
