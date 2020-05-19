<template>
  <el-card class="box-card">
    <el-table :data="purchase_submit_list" border style="width: 100%">
      <el-table-column prop="bill_no" label="采购单据号" width="120" />
      <el-table-column prop="submit_name" label="采购人" width="120" />
      <el-table-column prop="production_line_name" label="产线id" width="120" />
      <el-table-column prop="code" label="工夹具代码" width="180">
        <template slot-scope="scope">
          <el-select v-model="scope.row.code_count">
            <el-option v-for="(item,index) in scope.row.code.split('|')" :key="item" :value="item+' -- '+scope.row.count.split('|')[index]+'件'"> {{ item }} -- {{ scope.row.count.split('|')[index] }}件</el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="submit_time" label="申请时间" width="120"/>
      <el-table-column label="审批状态" width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.status === '0'">待审批</div>
          <div v-else-if="scope.row.status === '1'">初审不通过</div>
          <div v-else-if="scope.row.status === '2'">初审通过</div>
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
export default {
  name: 'Index',
  data: function() {
    return {
      purchase_submit_list: [],
      code_count: '',
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
  },
  watch: {
  },
  created() {
    this.get_purchase_submit_list()
  },
  methods: {
    get_purchase_submit_list: function() {
      this.$ajax.get('/supervisor/get_purchase_submit_list', {
        params: {
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          this.purchase_submit_list = response.data.list
          this.all = response.data.all_count
        }
      )
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
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
