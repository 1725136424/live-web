<template>
  <div>
    <el-container>
      <el-header>
        <Nav></Nav>
      </el-header>
      <el-main>
        <el-col class="main">
          <el-card shadow="hover">
            <el-form :model="registerForm" :rules="rules" class="demo-ruleForm" label-width="100px" ref="registerForm"
                     status-icon>
              <el-form-item label="昵称" prop="username">
                <el-input autocomplete="off" type="text" v-model="registerForm.username"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input autocomplete="off" type="password" v-model="registerForm.password"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input type="password" v-model="registerForm.confirmPassword"></el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-row>
                  <el-col :span="16">
                    <el-input type="phone" v-model="registerForm.phone"></el-input>
                  </el-col>
                  <el-col :offset="3" :span="4">
                    <el-button :disabled="codeDisable" @click="getCode" type="success" v-text="codeTex"></el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="验证码" prop="code">
                    <el-input v-model="registerForm.code"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="头像" prop="pic">
                    <el-upload
                      :action="uploadUrl"
                      :before-upload="beforeAvatarUpload"
                      :data="ossToken"
                      :on-remove="removePic"
                      :on-success="handleAvatarSuccess"
                      :show-file-list="true"
                      class="pic">
                      <img :src="registerForm.pic" class="avatar" v-if="registerForm.pic">
                      <i class="el-icon-plus avatar-uploader-icon" v-else></i>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button @click="submitForm('registerForm')" type="primary">注册</el-button>
                <el-button @click="resetForm('registerForm')">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import {OK, PHONE_IS_EXIST, RANDOM_NOT_MATCH, RANDOM_SEND_SHORT_INTERVAL, UPLOAD_URL} from '@/utils/Constant'
import Nav from '@/components/Nav'
import {getOSSPolicy, isExistByUsername, register, sendCode} from '@/api/RegisterApi'
import {uuid} from '@/utils/common'

export default {
  name: 'Login',
  components: {
    Nav
  },
  data: function () {
    let checkUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('用户名不能为空'))
      } else {
        // 远程查询用户名是否异常存在
        isExistByUsername(value)
          .then((data) => {
            let isExist = data.isExist
            if (isExist) {
              callback(new Error('用户名已经存在'))
            } else {
              callback()
            }
          })
          .catch(e => {
            console.log(e)
            callback(new Error('未知异常'))
          })
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
    let checkConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    let checkPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号码'))
      } else if (!value.match(/0?(13|14|15|18|17)[0-9]{9}/)) {
        callback(new Error('请输入正确的手机号码!'))
      } else {
        callback()
      }
    }
    let checkCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else if (value.length !== 6) {
        callback(new Error('请输入6位验证码!'))
      } else {
        callback()
      }
    }
    let checkPic = (rule, value, callback) => {
      console.log(value)
      if (value === '') {
        callback(new Error('请上传头像'))
      } else if (!value.match(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/)) {
        callback(new Error('图片格式不正确'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        code: '',
        pic: '',
        phone: ''
      },
      uploadUrl: '',
      codeTex: '获取验证码',
      codeDisable: false,
      rules: {
        username: [
          {validator: checkUsername, trigger: 'blur'}
        ],
        password: [
          {validator: checkPassword, trigger: 'blur'}
        ],
        confirmPassword: [
          {validator: checkConfirm, trigger: 'blur'}
        ],
        phone: [
          {validator: checkPhone, trigger: 'blur'}
        ],
        code: [
          {validator: checkCode, trigger: 'blur'}
        ],
        pic: [
          {validator: checkPic, trigger: 'blur'}
        ]
      },
      ossToken: {
        key: '',
        policy: '',
        OSSAccessKeyId: '',
        success_action_status: '200',
        callback: '',
        signature: ''
      }
    }
  },
  methods: {
    handleAvatarSuccess () {
      this.registerForm.pic = this.uploadUrl + this.ossToken.key
    },
    beforeAvatarUpload (file) {
      return new Promise((resolve, reject) => {
        // 获取签名
        getOSSPolicy()
          .then(({data}) => {
            // 填充验证数据
            this.ossToken.key = data.dir + uuid().replace('-', '') + '_' + file.name
            this.ossToken.policy = data.policy
            this.ossToken.OSSAccessKeyId = data.accessid
            if (data.callback) {
              this.ossToken.callback = data.callback
            } else {
              delete this.ossToken.callback
            }
            this.ossToken.signature = data.signature
            resolve()
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    getCode () {
      // 发送短信
      let phone = this.registerForm.phone
      if (phone) {
        if (!phone.match(/0?(13|14|15|18|17)[0-9]{9}/)) {
          this.$message({
            showClose: true,
            message: '请输入正确的手机号码',
            type: 'warning'
          })
        } else {
          sendCode(phone)
            .then((data) => {
              let code = data.code
              if (code === OK) {
                this.$message({
                  showClose: true,
                  message: '验证码发送成功',
                  type: 'info'
                })
              } else if (code === RANDOM_NOT_MATCH) {
                this.$message({
                  showClose: true,
                  message: '验证码不匹配',
                  type: 'error'
                })
              } else if (code === RANDOM_SEND_SHORT_INTERVAL) {
                this.$message({
                  showClose: true,
                  message: '验证码发送次数过多',
                  type: 'error'
                })
              }
            })
            .catch((e) => {
              console.log(e)
              this.$message({
                showClose: true,
                message: '未知异常',
                type: 'error'
              })
            })
          this.codeDisable = true
          let times = 60
          this.codeTex = times + 's获取验证码'
          let time = setInterval(() => {
            if (times <= 1) {
              clearInterval(time)
              this.codeDisable = false
              this.codeTex = '获取验证码'
              return
            }
            times -= 1
            this.codeTex = times + 's获取验证码'
          }, 1000)
        }
      } else {
        this.$message({
          showClose: true,
          message: '请输入手机号码',
          type: 'warning'
        })
      }
    },
    submitForm (form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          register(this.registerForm)
            .then((res) => {
              let code = res.code
              if (code === OK) {
                this.$router.push('/')
              } else if (code === PHONE_IS_EXIST) {
                this.$message({
                  showClose: true,
                  message: '该手机号已经注册',
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
            })
        } else {
          return false
        }
      })
    },
    resetForm (form) {
      this.$refs[form].resetFields()
    },
    removePic () {
      this.registerForm.pic = ''
    }
  },
  created () {
    this.uploadUrl = UPLOAD_URL
  }
}
</script>

<style lang="scss" scoped>
  .main {
    display: block;
    margin: 0 auto;
    width: 45%;
    float: none;
  }
  .pic {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409EFF;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
