<template>
  <el-card class="box-card">
    <el-table :data="repair_list" border>
      <el-table-column label="工夹具代码" prop="code" :filters="code_list_filter" :filter-method="filterHandler" sortable />
      <el-table-column label="工夹具序列号" prop="seq_id" />
      <el-table-column label="申请时间" prop="submit_name" />
      <el-table-column label="故障原因" prop="repair_reason" />
      <el-table-column label="申请时间" prop="submit_time" />
    </el-table>
    <el-divider />
    <el-pagination
      v-if="repair_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data() {
    return {
      repair_list: [],
      all: 0,
      page_size: 10,
      page_number: 1,
      code_list_filter: []
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  created() {
    this.getData()
    this.$ajax.get('/get_code_list').then(
      response => {
        this.code_list = response.data
        response.data.forEach(
          i => {
            this.code_list_filter.push({ text: i, value: i })
          }
        )
      }
    )
  },
  methods: {
    getData() {
      this.$ajax.get('/high/get_repair_jig', {
        params: {
          id: this.id,
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          const { data } = response
          this.repair_list = data.data
          this.all = data.all
          this.$message.success(`共有${data.all}条报修申请`)
        }
      )
    },
    /**
     * 页面大小改变事件
     * @param val
     */
    handleSizeChange: function(val) {
      this.page_size = val
      this.getData()
    },
    /**
     * 页码改变事件
     * @param val
     */
    handleCurrentChange: function(val) {
      this.page_number = val
      this.getData()
    },
    filterHandler(value, row, column) {
      return row.code === value
    }
  }
}
</script>

<style scoped>
  .box-card {
    width: 96%;
    margin: 2% 2%
  }
</style>
