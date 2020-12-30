<template>
  <div>
    <el-container>
      <el-header>
        <Nav @onmessage="onMessage" @socket="getData" @user="getUserData"></Nav>
      </el-header>
      <el-container class="main-box">
        <el-container>
          <el-header>
            <div class="header-left">
              <img :alt="live.username" :src="live.userPic">
            </div>
            <div class="header-right">
              <h3>{{ live.title }}</h3>
              <p>
                  <span class="hot">
                    <svg id="hot_84f8212" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path
                      d="M6.386 1.006a4.713 4.713 0 01-2.551 4.556C.949 6.991 1.407 12.042 5.732 13Q3.683 9.829 7.2 7.944a2.017 2.017 0 002.029 1.839c1.594 0 .57 3.22-.286 3.22s6.437 0 4.832-6.142q-.554-1.472-3.12-2.131a6.312 6.312 0 00-4.269-3.724z"
                      data-name="图层 1"
                      fill="#ff5a5a"
                      fill-rule="evenodd"></path></svg>
                    {{ live.hot }}
                  </span>
                <span class="follow">
                    <span>{{ live.ids? live.ids.length: 0 }}</span>
                    <span :class="isFollow? 'active': ''" @click="followBtn">
                      <svg id="follow_bf57393" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path
                        d="M8.4 1.986A3.45 3.45 0 0112 5.4c0 1.716-.566 2.464-1.918 3.868a13.375 13.375 0 01-2.4 1.856 8.383 8.383 0 01-1.682.89 17.736 17.736 0 01-4.076-2.747A4.839 4.839 0 010 5.4a3.483 3.483 0 013.6-3.414A2.8 2.8 0 016 3.9a2.61 2.61 0 012.4-1.914z"
                        data-name="图层 1"
                        fill="#fff" fill-rule="evenodd"></path></svg>
                      <diy>关注</diy>
                      <diy>已关注</diy>
                    </span>
                  </span>
              </p>
            </div>
          </el-header>
          <el-main>
            <VueAliplayerV2 :options="options" :source="sources[currentSourceIndex]" class="player"></VueAliplayerV2>
            <el-dropdown  @command="handleCommand" trigger="click" class="dropdown">
              <span class="el-dropdown-link">
                清晰度<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">流畅</el-dropdown-item>
                <el-dropdown-item command="2">标清</el-dropdown-item>
                <el-dropdown-item command="3">高清</el-dropdown-item>
                <el-dropdown-item command="4">超清</el-dropdown-item>
                <el-dropdown-item command="0">原画</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-main>
        </el-container>
        <el-aside width="350px">
          <div class="chat-box" ref="wrapper">
            <ul>
              <li :key="index" v-for="(text, index) in chartList">
                <img :src="text.pic" alt="">
                <span class="user">{{ text.username }}:</span>
                <span class="text">{{ text.message }}</span>
              </li>
            </ul>
            <div class="tool">
              <el-tag @click.native="() => lock = !lock" class="el-icon-lock" type="danger" v-if="!lock">锁定</el-tag>
              <el-tag @click.native="() => lock = !lock" class="el-icon-unlock" type="danger" v-else>解锁</el-tag>
              <el-tag @click="clearScreen" class="el-icon-delete" type="success">清屏</el-tag>
            </div>

          </div>
          <div class="input-text">
            <div class="emoji">
              <el-popover
                placement="top-start"
                trigger="click"
                width="310">
                <div v-html="emojis"></div>
                <div slot="reference"><i></i></div>
              </el-popover>
              <div class="text-number">
                <span>{{ chart.length }}</span>
                /
                <span>{{ maxChartLength}}</span>
              </div>
            </div>
            <div class="input">
              <input @input="input($event)" type="text" v-model="chart">
              <button @click="sendText" class="send">发送</button>
            </div>
          </div>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>import Nav from '@/components/Nav'
import emojiUtil from '@/utils/Emoji'
import IScroll from 'iscroll/build/iscroll-probe'
import $ from 'jquery'
import {followRoom, getLiveById} from '@/api/LiveApi'
import VueAliplayerV2 from 'vue-aliplayer-v2'
import {AUTH_ERROR, OK, WEBSOCKET_URL} from '@/utils/Constant'

export default {
  name: 'Live',
  components: {
    Nav,
    VueAliplayerV2
  },
  data: function () {
    return {
      isFollow: false,
      isFocus: false,
      emojis: '',
      emojiAry: [],
      chart: '',
      maxChartLength: 30,
      live: {},
      options: {
        isLive: true // 切换为直播流的时候必填
      },
      sources: [],
      currentSourceIndex: 0,
      user: {},
      socket: {},
      chartList: [],
      iScroll: {},
      lock: false,
      roomId: ''
    }
  },
  methods: {
    followBtn: async function () {
      // 判断当前是否登录
      if (!this.user) {
        this.$message({
          showClose: true,
          type: 'error',
          message: '请登录后，再进行此操作'
        })
      } else {
        // 发送数据
        let {code} = await followRoom(this.roomId)
        if (code === OK) {
          this.isFollow = !this.isFollow
        } else if (code === AUTH_ERROR) {
          this.$message({
            showClose: true,
            message: '请登录',
            type: 'error'
          })
        } else {
          this.$message({
            showClose: true,
            message: '未知异常',
            type: 'error'
          })
        }
      }
    },
    input () {
      let length = this.chart.length
      if (length > this.maxChartLength) {
        this.chart = this.chart.substr(0, length - 1)
      }
    },
    getData (socket) {
      this.socket = socket
    },
    getUserData (user) {
      this.user = user
    },
    sendText () {
      if (!this.user) {
        this.$message({
          showClose: true,
          message: '请登录',
          type: 'error'
        })
      } else {
        let text = this.chart
        if (text.trim()) {
          let sendObj = {
            id: this.user.id,
            message: text,
            username: this.user.username,
            pic: this.user.pic
          }
          let url = WEBSOCKET_URL + this.user.id
          this.socket.wsuri = url
          this.socket.websock.send(JSON.stringify(sendObj))
          this.chart = ''
        } else {
          this.$message({
            showClose: true,
            message: '请输入文字内容',
            type: 'error'
          })
        }
      }
    },
    onMessage (res) {
      let data = JSON.parse(res.data)
      this.chartList.push(data)
      // 刷新iscroll
      this.iScroll.refresh()
      if (!this.lock) {
        // 滚动最底部
        this.iScroll.scrollTo(0, this.iScroll.maxScrollY, 100)
      }
    },
    clearScreen () {
      this.chartList = []
      // 刷新iscroll
      setTimeout(() => {
        this.iScroll.refresh()
      }, 100)
    },
    handleCommand (index) {
      this.currentSourceIndex = index
    }
  },
  mounted () {
    // 初始化表情
    let content = ''
    this.emojiAry = emojiUtil.emojis()
    this.emojiAry.forEach((v, i) => {
      let prefix = `<li style="cursor: pointer; margin: 2px" index='${i}'>`
      let suffix = '</li>'
      content += prefix + v + suffix
    })
    this.emojis = '<ul ref="emojis" class="emojis" style="display: flex; flex-wrap: wrap; list-style: none; margin: 0">' + content + '</ul>'

    // 初始化iscroll
    // eslint-disable-next-line no-new
    this.iScroll = new IScroll(this.$refs.wrapper, {
      mouseWheel: true,
      scrollbars: true,
      probeType: 3,
      scrollY: true,
      scrollX: false
    })
  },
  async created () {
    this.$nextTick(() => {
      // 初始化标签
      let vueThis = this
      setTimeout(() => {
        $('.emojis li').click(function () {
          let index = $(this).index()
          if ((vueThis.chart.length + vueThis.emojiAry[index].length) <= vueThis.maxChartLength) {
            vueThis.chart += vueThis.emojiAry[index]
          }
        })
      }, 200)
    })
    // 直播间id
    let roomId = this.$route.query.id
    this.roomId = roomId
    let {live} = await getLiveById(roomId)
    // 添加播放源
    this.sources = live.playUrl.split(';')
    this.live = live
    // 构造关注信息
    if (live.ids) {
      let index = live.ids.indexOf(this.user.id)
      if (index !== -1) {
        this.isFollow = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-box {
    margin-bottom: 50px;
    margin-top: 36px;
    box-sizing: border-box;
    padding: 0 40px;

    .el-container {
      margin-right: 20px;

      .el-header {
        background: #ffffff;
        height: 100px !important;
        display: flex;
        justify-content: start;
        align-items: center;

        .header-left {
          margin-right: 20px;
          width: 92px;
          height: 92px;

          img {
            border-radius: 6px;
            width: 100%;
            height: 100%;
          }
        }

        .header-right {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;

          h3 {
            color: #3a3a3a;
            font-size: 24px;
            margin-bottom: 20px;
          }

          p {
            -moz-user-select: none; /*火狐*/
            -webkit-user-select: none; /*webkit浏览器*/
            -ms-user-select: none; /*IE10*/
            -khtml-user-select: none; /*早期浏览器*/
            user-select: none;
            text-align: left !important;
            color: #666666;
            font-size: 14px;

            .hot {
              margin-right: 10px;

              svg {
                width: 14px;
                height: 14px;
              }
            }

            .follow {
              span {
                text-align: center;
                line-height: 24px;
                display: inline-block;
                width: 72px;
                height: 24px;
                border-radius: 12px;
                font-size: 12px;

                &:nth-of-type(1) {
                  width: 90px;
                  color: #666666;
                  background: rgba(177, 183, 189, 0.1);
                }

                &:nth-of-type(2) {
                  cursor: pointer;
                  position: relative;
                  left: -26px;
                  color: #ffffff;
                  background: #fd7423;

                  svg {
                    vertical-align: -1px;
                    margin-right: 2px;
                    width: 12px;
                    height: 12px;
                  }

                  diy {
                    display: none;

                    &:nth-of-type(1) {
                      display: inline-block;
                    }

                    &:nth-of-type(2) {
                      display: none;
                    }
                  }

                  &:hover {
                    background: #ff5d23;
                  }

                  &.active {
                    background: #cbcbcb;

                    svg {
                      display: none;
                    }

                    diy {
                      &:nth-of-type(1) {
                        display: none;
                      }

                      &:nth-of-type(2) {
                        display: inline-block;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      .el-main {
        overflow: hidden;
        margin-top: 16px;
        height: 600px;
        padding: 0 !important;
      }
    }

    .el-aside {
      background: #ffffff;

      .chat-box {
        position: relative;
        overflow: hidden;
        height: 600px;
        display: flex;
        flex-direction: column;
        justify-content: end;

        .tool {
          transition: all 0.3s;
          display: none;
          position: absolute;
          top: 100px;
          right: 20px;

          .el-tag {
            text-align: center;
            line-height: 24px;
            font-size: 10px;
            width: 50px;
            height: 24px;
            cursor: pointer;
          }
        }

        ul {
          padding: 20px;

          li {
            margin-top: 20px;
            display: flex;
            justify-content: start;
            align-items: center;
            font-size: 13px;

            img {
              border-radius: 50%;
              width: 28px;
              height: 28px;
              margin-right: 4px;
            }

            .user {
              white-space: nowrap;
              color: #3c9cfe;
              margin-right: 4px;
            }

            .text {
              font-size: 13px;
              text-align: left;
              color: #333333;
            }
          }
        }

        &:hover {
          .tool {
            display: block;
          }
        }
      }

      .input-text {
        border-top: 1px #eeeeee solid;
        height: 120px;

        & > div {
          margin: 10px 20px;
        }

        .emoji {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 26px;
        }

        i {
          cursor: pointer;
          float: left;
          width: 22px;
          height: 22px;
          display: inline-block;
          background: url("./../assets/images/emoji.png");
        }

        .text-number {
          color: #949ca1;
          font-size: 14px;
        }
      }

      .input {
        overflow: hidden;
        display: flex;
        justify-content: start;
        margin: 0 auto;
        width: 80%;
        border-radius: 6px;
        border: 1px #eeeeee solid;
        height: 50px;

        input {
          font-size: 12px;
          letter-spacing: 0.1em;
          outline: none;
          box-sizing: border-box;
          padding-left: 10px;
          border: none;
          width: 80%;
        }

        button {
          outline: none;
          cursor: pointer;
          background: #ff8a00;
          border: none;
          width: 20%;
          color: #ffffff;
          font-size: 14px;
        }
      }
    }
  }

  .player {
    height: 600px !important;
  }
  .el-main {
    .dropdown {
      display: none;
      cursor: pointer;
      color: #333333;
      text-align: center;
      line-height: 30px;
      font-size: 12px;
      border-radius: 15px;
      width: 100px;
      height: 30px;
      background: #ffffff;
      position: absolute ;
      left: 65% ;
      bottom: -20px;
      z-index: 999999;
    }
    &:hover {
      .dropdown {
        display: block;
      }
    }
  }

</style>
