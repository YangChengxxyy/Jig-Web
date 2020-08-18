<template>
  <el-collapse-item title="追溯出入库历史" name="1">
    <el-timeline v-if="out_and_in_history_list.length > 0">
      <el-timeline-item
        v-for="(item, index) in out_and_in_history_list"
        :key="index"
        :icon="item.icon"
        :type="item.type"
        :timestamp="item.outgo_time"
      >
        <template v-if="item.status === '0'">
          申请人:{{ item.submit_name }} <br>
          产线: {{ item.production_line_name }} <br>
          出库人: {{ item.rec_name }}
        </template>
        <template v-if="item.status === '1'">
          归还人: {{ item.submit_name }} <br>
          产线: {{ item.production_line_name }} <br>
          入库人: {{ item.rec_name }}
        </template>
        <template v-if="item.status === '2'">
          调换位置: {{ item.description }}<br>
          操作人: {{ item.rec_name }}
        </template>
        <template v-if="item.status === '3'">
          采购入库: <br>
          <template v-for="(des, des_index) in item.description.split('~')">
            <template v-if="des_index === 0">单据号: {{ des }} <br :key="'bill_no_'+des"></template>
            <template v-if="des_index === 1">
              工夹具代码及件数: <br :key="'code_count_des_' + des_index">
              <template v-for="(input_code, i) in des.split('|')">&nbsp;&nbsp;&nbsp;&nbsp;{{ input_code }} - {{
                item.description.split('~')[2].split('|')[i] }} 件 <br :key="'code_count_'+input_code"></template>
            </template>
          </template>
          入库人: {{ item.rec_name }}
        </template>
      </el-timeline-item>
    </el-timeline>
    <div v-else="" class="font-info">暂无该工夹具出入库历史记录</div>
  </el-collapse-item>
</template>

<script>
export default {
  name: 'OutInHistory',
  props: {
    jigEntity: {
      code: '',
      seq_id: ''
    }
  },
  data: function() {
    return {
      out_and_in_history_list: []
    }
  },
  watch: {
    jigEntity() {
      this.get_out_and_in_history()
    }
  },
  created() {
    this.get_out_and_in_history()
  },
  methods: {
    get_out_and_in_history: function() {
      this.$ajax.get('/api/naive/get_out_and_in_history_list', {
        params: {
          code: this.jigEntity.code,
          seq_id: this.jigEntity.seq_id
        }
      }).then(
        response => {
          this.out_and_in_history_list = response.data
          this.set_icon_out_and_in_history()
        }
      )
    },
    set_icon_out_and_in_history: function() {
      for (var i = 0; i < this.out_and_in_history_list.length; i++) {
        var list = this.out_and_in_history_list
        if (list[i].status === '0') { // 出库
          list[i].icon = 'el-icon-s-unfold'
          list[i].type = 'primary'
        } else if (list[i].status === '1') { // 入库
          list[i].icon = 'el-icon-s-fold'
          list[i].type = 'primary'
        } else if (list[i].status === '2') { // 调换位置
          list[i].icon = 'el-icon-rank'
          list[i].type = 'warning'
        } else if (list[i].status === '3') { // 采购入库
          list[i].icon = 'el-icon-s-order'
          list[i].type = 'success'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
