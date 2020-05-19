<template>
  <el-card class="box-card">
    <el-form ref="form" :model="form" label-width="100px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具代码" prop="code">
            <el-input v-model="form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="工夹具序列号" prop="seq_id">
            <el-input v-model="form.seq_id" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="报废原因" prop="scrap_reason">
            <el-input v-model="form.scrap_reason" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="审批状态" prop="status">
            <el-select v-model="form.status">
              <el-option v-for="item in [{value: '0',label: '未处理'},{value: '1',label: '已处理'}]" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="时间范围" prop="date">
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
        <el-col :span="11">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clearForm()">清空</el-button>
          <el-button :disabled="history_list.length === 0">导出本页</el-button>
          <el-button :disabled="history_list.length === 0">导出全部</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="22" :offset="1">
          <el-divider />
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="history_list" border>
          <el-table-column label="工夹具代码" prop="code" />
          <el-table-column label="工夹具序列号" prop="seq_id" />
          <el-table-column label="申请人" prop="submit_name" />
          <el-table-column label="故障原因" prop="scrap_reason" />
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="处理状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status === '1'">已同意</span>
              <span v-else>未同意</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="showHistory(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data() {
    return {
      form: {
        code: '',
        seq_id: '',
        scrap_reason: '',
        status: '',
        date: ['', '']
      },
      history_list: [],
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
  methods: {
    getData() {
      this.$ajax.get('/high/search_scrap_history', {
        params: {
          submit_id: this.id,
          code: this.form.code,
          seq_id: this.form.seq_id,
          scrap_reason: this.form.scrap_reason,
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
            this.$message.info('没有查询到结果')
          } else {
            this.$message.success(`查询到${data.all}条记录`)
          }
        }
      )
    },
    search() {
      this.page_number = 1
      this.getData()
    },
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
    clearForm() {
      this.form = {
        code: '',
        seq_id: '',
        scrap_reason: '',
        status: '',
        date: ['', '']
      }
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
