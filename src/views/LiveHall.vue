<template>
  <div>
    <el-container>
      <el-header>
        <Nav @fnc="triggerCategory" @fnc1="triggerSearch"></Nav>
      </el-header>
      <el-main>
        <el-row class="category">
          <el-col :span="2" class="category-tip">当前分类:</el-col>
          <el-col :span="1"><el-tag type="success">{{ category.name?  category.name: '所有直播'}}</el-tag></el-col>
        </el-row>
        <el-divider></el-divider>
      </el-main>
      <el-footer>
        <ul>
          <li v-if="lives.length > 0" v-for="item in lives" :key="item.id" class="live" @click="live(item.id)">
            <div class="top">
              <img class="bg" :src="item.livePic" :alt="item.title">
              <img class="play" src="../assets/images/play.png" alt="">
              <div class="mask"></div>
            </div>
            <div class="bottom">
              <p class="title" v-text="item.title"></p>
              <p class="dis">
                  <span class="tro">
                    <img :src="item.userPic" :alt="item.username">
                    {{item.username}}
                  </span>
                <span class="number">
                    <i></i>
                  {{item.hot}}
                  </span>
              </p>
            </div>
          </li>
        </ul>
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="searchParams.limit"
          :current-page="searchParams.page"
          :total="searchParams.total">
        </el-pagination>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import Nav from '@/components/Nav'
import {getCategory, getLive} from '@/api/LiveHallApi'

export default {
  name: 'LiveHall',
  data () {
    return {
      searchParams: {
        page: 2,
        limit: 5,
        total: 10,
        sidx: 'create_time',
        order: 'desc',
        category: '',
        keywords: ''
      },
      category: {},
      lives: []
    }
  },
  components: {
    Nav
  },
  methods: {
    live: function (roomId) {
      this.$router.push({path: '/live', query: { id: roomId }})
    },
    async pageList () {
      // 发送请求
      let data = await getLive(this.searchParams)
      this.searchParams.page = data.page.currPage
      this.searchParams.limit = data.page.pageSize
      this.searchParams.total = data.page.totalCount
      this.lives = data.page.list
    },
    triggerCategory (categoryId) {
      this.searchParams.category = categoryId
      this.setCategory(categoryId)
      this.pageList()
    },
    triggerSearch (keywords) {
      this.searchParams.keywords = keywords
      this.pageList()
    },
    async setCategory (categoryId) {
      // 查询分类
      let {category} = await getCategory(categoryId)
      this.category = category
    }
  },
  created () {
    // 获取当前直播数据
    this.pageList()
  }
}
</script>

<style lang="scss" scoped>
  .diy-row {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
  }
  .el-main {
    margin-top: 20px;
  }
  .category {
    padding-top: 20px;
    height: 60px;
    background: #ffffff;
    .category-tip {
      color: #303133;
    }
  }
  ul {
    flex-wrap: wrap;
    display: flex;
    justify-content: start;
    .live {
      margin: 0 28px 26px 28px;
      width: 306px;
      border-radius: 10px;
      overflow: hidden;
      background: #ffffff;
      cursor: pointer;
      .top {
        height: 171.5px;
        position: relative;
        .bg {
          width: 100%;
        }
        .play {
          width: 100px;
          height: 100px;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: all .25s ease-out;
          opacity: 0;
        }
        .mask {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          transition: all .3s ease-out
        }
        &:hover {
          .mask {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
          }
          .play {
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
        }
      }
      .bottom {
        padding: 4px 6px;
        .title {
          margin: 0;
          height: 20px;
          line-height: 20px;
          text-align: left;
          color: #333;
          font-size: 14px;
          transition: color 0.5s;
          &:hover {
            color: #FF9600;
          }
        }
        .dis {
          margin: 6px 0 0 0;
          display: flex;
          justify-content: space-between;
          color: #999;
          font-size: 12px;
          align-items: center;
          .tro {
            display: flex;
            justify-content: start;
            align-items: center;
            img {
              border-radius: 50%;
              width: 24px;
              height: 24px;
              margin-right: 5px;
            }
          }
          .number {
            i {
              width: 16px;
              height: 12px;
              display: inline-block;
              background: url("../assets/images/icon.png");
            }
          }
        }
      }
    }
  }
  .el-pagination {
    padding: 20px 0 50px 0;
  }
</style>
