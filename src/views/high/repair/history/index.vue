<template>
  <el-card class="box-card">
    <el-form ref="form" :model="form" label-width="100px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具代码">
            <el-input v-model="form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="工夹具序列号">
            <el-input v-model="form.seq_id" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="申请人">
            <el-input v-model="form.submit_name" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="故障原因">
            <el-input v-model="form.trouble_reason" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="审批状态">
            <el-select v-model="form.status">
              <el-option v-for="item in [{value: '0',label: '未处理'},{value: '1',label: '已处理'}]" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-button icon="el-icon-delete" @click="clearForm()">清空</el-button>
          <el-link :href="onePage" :disabled="history_list.length === 0"><el-button>导出本页</el-button></el-link>
          <el-link :href="allPage" :disabled="history_list.length === 0"><el-button>导出全部</el-button></el-link>
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-divider />
        <el-table :data="history_list" border>
          <el-table-column label="工夹具实体" prop="code">
            <template slot-scope="scope">
              <div>{{ scope.row.code }}-{{ scope.row.seq_id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="申请人" prop="submit_name" />
          <el-table-column label="故障原因" prop="repair_reason" />
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
        <el-divider />
      </el-col>
    </el-row>
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
    <el-dialog title="报修明细" :visible.sync="dialogVisible" width="30%">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="history != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具代码">
              <el-input v-model="history.code" readonly />
            </el-form-item>
            <el-form-item label="工夹具序列号">
              <el-input v-model="history.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报修原因">
              <el-input v-model="history.repair_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="history.repair_photo_url.split('|')[0]" :preview-src-list="history.repair_photo_url.split('|')" />
            </el-form-item>
            <el-form-item label="申请人id">
              <el-input v-model="history.submit_id" readonly />
            </el-form-item>
            <el-form-item label="申请人">
              <el-input v-model="history.submit_name" readonly />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="history.submit_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import defaultSettings from '@/settings'
const { devServer } = defaultSettings
import { getUrl } from '@/utils'
export default {
  name: 'Index',
  data() {
    return {
      form: {
        code: '',
        seq_id: '',
        submit_name: '',
        trouble_reason: '',
        status: '',
        date: ['', '']
      },
      page_number: 1,
      page_size: 10,
      history_list: [],
      all: 0,
      history: null,
      dialogVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'token'
    ]),
    onePage() {
      const url = devServer + '/api/high/download_one_repair_history'
      const a = {
        id: this.id,
        code: this.form.code,
        seq_id: this.form.seq_id,
        submit_name: this.form.submit_name,
        status: this.form.status,
        start_date: this.form.date[0],
        end_date: this.form.date[1],
        page_number: this.page_number,
        page_size: this.page_size,
        file_name: `page-${this.page_number}.xls`,
        token: this.token.token
      }
      return url + '?' + getUrl(a)
    },
    allPage() {
      const url = devServer + '/api/high/download_all_repair_history'
      const a = {
        id: this.id,
        code: this.form.code,
        seq_id: this.form.seq_id,
        submit_name: this.form.submit_name,
        status: this.form.status,
        start_date: this.form.date[0],
        end_date: this.form.date[1],
        file_name: 'page-all.xls',
        token: this.token.token
      }
      return url + '?' + getUrl(a)
    }
  },
  methods: {
    getData() {
      this.$ajax.get('/api/high/search_repair_history', {
        params: {
          id: this.id,
          code: this.form.code,
          seq_id: this.form.seq_id,
          submit_name: this.form.submit_name,
          status: this.form.status,
          start_date: this.form.date[0],
          end_date: this.form.date[1],
          page_number: this.page_number,
          page_size: this.page_size
        }}).then(
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
    clearForm() {
      this.form = {
        code: '',
        seq_id: '',
        submit_name: '',
        trouble_reason: '',
        status: '',
        date: ['', '']
      }
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
    showHistory(row) {
      this.history = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
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
