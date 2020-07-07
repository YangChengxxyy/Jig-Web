<template>
  <el-card class="box-card">
    <el-table :data="purchase_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column prop="bill_no" label="采购单据号" />
      <el-table-column prop="submit_name" label="采购人" />
      <el-table-column prop="production_line_name" label="产线" />
      <el-table-column prop="code" label="工夹具代码及其数量">
        <template slot-scope="scope">
          <el-tree :data="getTree(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="submit_time" label="申请时间" />
      <el-table-column label="状态" width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.status === '0'">待入库</div>
          <div v-else-if="scope.row.status === '1'">已入库</div>
          <span v-else>终审通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="purchase_submit_list.length !== 0"
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
  data: function() {
    return {
      purchase_submit_list: [],
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'workcell_id',
      'token'
    ])
  },
  created() {
    this.get_purchase_submit_list()
  },
  methods: {
    get_purchase_submit_list: function() {
      this.$ajax.get('/api/naive/get_pending_purchase_submit_list', {
        params: {
          workcell_id: this.workcell_id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          this.purchase_submit_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    getTree: function(row) { // 获取采购审批的工夹具及其数量树形图
      const a = []
      const codes = row.code.split('|')
      const counts = row.count.split('|')
      codes.forEach((v, i) => {
        a.push({ label: v + ' - ' + counts[i] + '件', children: null })
      })
      return a
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_purchase_submit_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_purchase_submit_list()
    }
  }
}
</script>

<style scoped>
  .box-card{
    width: 96%;
    margin: 2% 2%
  }
  .font-success{
    color: #67C23A;
  }
  .font-error{
    color: #F56C6C;
  }
  .font-warning{
    color: #E6A23C;
  }
  .font-info{
    color: #909399;
  }
</style>
