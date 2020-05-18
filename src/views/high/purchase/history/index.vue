<template>
  <el-card class="box-card">
    <el-form ref="form" :model="form" label-width="100px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="单据号">
            <el-input v-model="form.bill_no" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="采购人">
            <el-input v-model="form.submit_name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具代码">
            <el-input v-model="form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="产线">
            <el-select v-model="form.production_line_id" style="width: 100%">
              <el-option v-for="item in production_line_list" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="审批状态">
            <el-select v-model="form.status">
              <el-option
                v-for="item in [{value: '0',label: '未处理'},{value: '1',label: '已处理'}]"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="form.date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['12:00:00']"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="12">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-delete">清空</el-button>
          <el-button>导出本页</el-button>
          <el-button>导出全部</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-table :data="history_list" border>
      <el-table-column label="采购单据号" prop="bill_no" />
      <el-table-column label="采购采购人" prop="submit_name" />
      <el-table-column label="产线" prop="production_line_name" />
      <el-table-column label="工夹具及代码数量">
        <template slot-scope="scope">
          <el-tree :data="getTree(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="submit_time" />
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">待处理</span>
          <span v-else-if="scope.row.status === 1">已同意</span>
          <span v-else>未同意</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="showHistory(scope.row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-divider />
    <el-pagination
      v-if="history_list.length !== 0"
      style="width: 30%;margin: 0 35%"
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
      history_list: [],
      production_line_list: [],
      form: {
        bill_no: '',
        submit_name: '',
        code: '',
        production_line_id: '',
        status: '',
        date: ['', '']
      },
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  created() {
    this.$ajax('/get_production_line_list').then(
      res => {
        this.production_line_list = res.data
      }
    )
  },
  methods: {
    getData() {
      this.$ajax.get('high/search_purchase_income_history', {
        params: {
          bill_no: this.form.bill_no,
          submit_name: this.form.submit_name,
          code: this.form.code,
          production_line_id: this.form.production_line_id,
          status: this.form.status,
          start_date: this.form.date[0],
          end_date: this.form.date[1],
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.history_list = data.data
          this.all = data.all
          if (data.all === 0) {
            this.$message.info('查询暂无结果')
          } else {
            this.$message.success('查询到' + data.all + '条记录')
          }
        }
      )
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.getData()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.getData()
    },
    search() {
      this.page_number = 1
      this.getData()
    },
    getTree(row) {
      const a = []
      const codes = row.code.split('|')
      const counts = row.count.split('|')
      codes.forEach((v, i) => {
        a.push({ label: v + ' - ' + counts[i] + '件', children: null })
      })
      return a
    },
    showHistory(row) {
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
