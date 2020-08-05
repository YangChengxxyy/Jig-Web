<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />
    <div v-show="false">{{ change }}</div>
    <div class="right-menu">
      <el-dropdown
        class="avatar-container"
        trigger="click"
        size="small"
        @visible-change="messageChange($event)"
      >
        <div class="avatar-wrapper">
          <el-badge :value="unreadMessage.length">
            <img src="@/icons/notification.png" class="message">
          </el-badge>
        </div>

        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-tooltip
            v-for="(value ,name, index) in unreadMessage"
            :key="index"
            class="item"
            effect="dark"
            content="点击查看"
            placement="top"
          >
            <el-dropdown-item :divided="index == unreadMessage.length - 1">
              <el-badge
                is-dot
              >{{ value.content }}</el-badge>
              <div class="message-time">{{ formatTime(value.date) }}</div>
            </el-dropdown-item>
          </el-tooltip>
          <el-tooltip
            v-for="(value ,name, index) in readMessage"
            :key="index"
            class="item"
            effect="dark"
            content="点击查看"
            placement="top"
          >
            <el-dropdown-item :divided="index == readMessage.length - 1">
              <el-badge
                is-dot
              >{{ value.content }}</el-badge>
              <div class="message-time">{{ formatTime(value.date) }}</div>
            </el-dropdown-item>
          </el-tooltip>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar_url" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link :to="{ name: token.role }">
            <el-dropdown-item>Home</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { formatTime } from '@/utils/index'
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      change: 1,
      changeTime: 1,
      unreadMessage: [],
      readMessage: [],
      isMessage: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar_url', 'token', 'id'])
  },
  created: function() {
    this.$ajax
      .get('/api/message/get_message', {
        params: {
          id: this.id
        }
      })
      .then(response => {
        const message = response.data
        console.log(message)
        for (var i = 0; i < message.length; i++) {
          if (message[i].read) {
            this.readMessage.push(message[i])
          } else {
            this.unreadMessage.push(message[i])
          }
        }
        this.changeTime = setInterval(() => {
          if (this.isMessage) {
            this.change++
          }
        }, 1000)
      })
  },
  beforeDestroy() {
    clearInterval(this.changeTime)
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    messageChange(e) {
      this.isMessage = e
    },
    formatTime(date) {
      if (date.constructor === Date) {
        return formatTime(date.getTime())
      } else if (date.constructor === Number) {
        return formatTime(date)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.message {
  cursor: pointer;
  width: 25px;
  height: 25px;
  border-radius: 10px;
}
.message-time {
  color: #909399;
}
</style>
