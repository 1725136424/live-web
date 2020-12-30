<template>
  <div>
    <el-container>
      <el-header>
        <Nav></Nav>
      </el-header>
      <el-main>
        <el-col class="main">
          <el-card shadow="hover">
            <el-form :model="resetForm" :rules="rules" class="demo-ruleForm" label-width="100px" ref="resetForm"
                     status-icon>
              <el-form-item label="手机号" prop="phone">
                <el-row>
                  <el-col :span="16">
                    <el-input type="phone" v-model="resetForm.phone"></el-input>
                  </el-col>
                  <el-col :offset="3" :span="4">
                    <el-button :disabled="codeDisable" @click="getCode" type="success" v-text="codeTex"></el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="验证码" prop="code">
                    <el-input v-model="resetForm.code"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="密码" prop="password">
                <el-input autocomplete="off" type="password" v-model="resetForm.password"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="submitForm('resetForm')" type="primary">重置密码</el-button>
                <el-button @click="reset('resetForm')">清空表单</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {OK, PHONE_NOT_EXIST, RANDOM_NOT_MATCH, RANDOM_SEND_SHORT_INTERVAL} from '@/utils/Constant'
import Nav from '@/components/Nav'
import {sendCode} from '@/api/RegisterApi'
import {resetPassword} from '@/api/ResetApi'

export default {
  name: 'Login',
  components: {
    Nav
  },
  data: function () {
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
    return {
      resetForm: {
        phone: '',
        password: '',
        code: ''
      },
      codeTex: '获取验证码',
      codeDisable: false,
      rules: {
        password: [
          {validator: checkPassword, trigger: 'blur'}
        ],
        phone: [
          {validator: checkPhone, trigger: 'blur'}
        ],
        code: [
          {validator: checkCode, trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    getCode () {
      // 发送短信
      let phone = this.resetForm.phone
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
          resetPassword(this.resetForm)
            .then((data) => {
              let code = data.code
              if (code === OK) {
                this.$message({
                  showClose: true,
                  type: 'info',
                  message: '重置密码成功'
                })
              } else if (code === PHONE_NOT_EXIST) {
                this.$message({
                  showClose: true,
                  type: 'error',
                  message: '该手机号不存在'
                })
              } else if (code === RANDOM_NOT_MATCH) {
                this.$message({
                  showClose: true,
                  type: 'error',
                  message: '验证码不匹配'
                })
              } else {
                this.$message({
                  showClose: true,
                  type: 'error',
                  message: '未知异常'
                })
              }
            })
            .catch((e) => {
              console.log(e)
            })
        } else {
          return false
        }
      })
    },
    reset (form) {
      this.$refs[form].resetFields()
    }
  }
}
</script>

<style scoped lang="scss">
  .main {
    display: block;
    margin: 80px auto;
    width: 45%;
    float: none;
  }
</style>
