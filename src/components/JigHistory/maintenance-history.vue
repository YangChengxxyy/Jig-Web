<template>
  <el-collapse-item title="追溯检点历史" name="1">
    <el-timeline
      v-if="maintenance_history_list.length > 0"
    >
      <el-timeline-item
        v-for="(item, index) in maintenance_history_list"
        :key="index"
        :icon="item.icon"
        :type="item.type"
        :timestamp="item.check_time"
      >
        <template v-if="item.is_repair === 0">
          检点人:{{ item.check_name }} <br>
          检修问题:
          <template v-if="item.reason_description.length > 0">
            <template v-for="(reason, i1) in item.reason_description">
              <div :key="reason" class="font-warning">{{ i1+1 }}.{{ reason }}</div>
            </template>
          </template>
          <template v-else>
            正常<br>
          </template>
          报修情况: 无需报修
        </template>
        <template v-if="item.is_repair === 1">
          检点人:{{ item.check_name }} <br>
          检修问题:
          <template v-if="item.reason_description.length > 0">
            <template v-for="(reason, i2) in item.reason_description">
              <div :key="reason" class="font-warning">{{ i2+1 }}.{{ reason }}</div>
            </template>
          </template>
          <template v-else>
            <div class="font-success">正常<br></div>
          </template>
          报修情况: 已报修
        </template>
      </el-timeline-item>
    </el-timeline>
    <div v-else class="font-info">暂无该工夹具检点历史记录</div>
  </el-collapse-item>
</template>

<script>
export default {
  name: 'MaintenanceHistory',
  props: {
    jig_entity: {
      code: '',
      seq_id: ''
    }
  },
  data: function() {
    return {
      maintenance_history_list: []
    }
  },
  watch: {
    jig_entity() {
      this.get_maintenance_history_list()
    }
  },
  created() {
    this.get_maintenance_history_list()
  },
  methods: {
    get_maintenance_history_list: function() {
      this.$ajax.get('/api/naive/get_jig_maintenance_history_list', {
        params: {
          code: this.jig_entity.code,
          seq_id: this.jig_entity.seq_id
        }
      }).then(
        response => {
          this.maintenance_history_list = response.data
          this.set_icon()
        }
      )
    },
    set_icon: function() {
      for (var i = 0; i < this.maintenance_history_list.length; i++) {
        var m_list = this.maintenance_history_list
        if (m_list[i].is_repair === 0) { // 无需报修
          m_list[i].icon = 'el-icon-check'
          m_list[i].type = 'success'
        } else if (m_list[i].is_repair === 1) { // 需要报修
          m_list[i].icon = 'el-icon-warning-outline'
          m_list[i].type = 'warning'
        }
      }
    }
  }
}
</script>

<style scoped>
  .font-warning {
    color: #E6A23C;
  }
</style>
