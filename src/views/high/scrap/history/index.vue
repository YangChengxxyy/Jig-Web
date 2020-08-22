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
          <el-link :href="onePage" :disabled="history_list.length === 0"><el-button>导出本页</el-button></el-link>
          <el-link :href="allPage" :disabled="history_list.length === 0"><el-button>导出全部</el-button></el-link>
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
          <el-table-column label="工夹具实体" prop="code">
            <template slot-scope="scope">
              <span>{{ scope.row.code }}-{{ scope.row.seq_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="报废照片" prop="scrap_photo_url">
            <template slot-scope="scope">
              <el-image
                :src="scope.row.scrap_photo_url.split('|')[0]"
                :preview-src-list="scope.row.scrap_photo_url.split('|')"
                style="max-height: 120px"
              />
            </template>
          </el-table-column>
          <el-table-column label="故障原因" prop="scrap_reason" />
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="处理状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status === '0'">待处理</span>
              <span v-else-if="scope.row.status === '4'" class="font-success">已同意</span>
              <span v-else class="font-error">未同意</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="showHistory(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="history_list.length !== 0"
          style="text-align: center"
          :current-page="page_number"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="all"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-col>
    </el-row>
    <el-dialog title="报废明细" :visible.sync="show_history_dialog" width="40%">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="scrap_history != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具实体">
              <el-input :value="scrap_history.code + '-' +scrap_history.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报废原因">
              <el-input v-model="scrap_history.scrap_reason" type="textarea" :rows="3" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="scrap_history.scrap_photo_url.split('|')[0]" :preview-src-list="scrap_history.scrap_photo_url.split('|')" />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="scrap_history.submit_time" readonly />
            </el-form-item>
            <el-form-item label="审批状态">
              <el-input v-if="scrap_history.status === '0'" value="待初审" readonly />
              <el-input v-else-if="scrap_history.status === '1'" value="初审未通过" readonly />
              <el-input v-else-if="scrap_history.status === '2'" value="初审通过" readonly />
              <el-input v-else-if="scrap_history.status === '3'" value="终审未通过" readonly />
              <el-input v-else value="终审通过" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_history.first_acceptor_time!=null" label="初审时间">
              <el-input v-model="scrap_history.first_acceptor_time" />
            </el-form-item>
            <el-form-item v-if="scrap_history.first_acceptor_name!=null" label="初审人">
              <el-input v-model="scrap_history.first_acceptor_name" />
            </el-form-item>
            <el-form-item v-if="scrap_history.first_reason!=null" label="初审不通过原因">
              <el-input v-model="scrap_history.first_reason" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item v-if="scrap_history.final_acceptor_time!=null" label="终审时间">
              <el-input v-model="scrap_history.final_acceptor_time" />
            </el-form-item>
            <el-form-item v-if="scrap_history.final_acceptor_name!=null" label="终审人">
              <el-input v-model="scrap_history.final_acceptor_name" />
            </el-form-item>
            <el-form-item v-if="scrap_history.final_acceptor_time!=null" label="终审不通过原因">
              <el-input v-model="scrap_history.final_acceptor_time" type="textarea" :rows="3" />
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
        scrap_reason: '',
        status: '',
        date: ['', '']
      },
      history_list: [],
      page_size: 10,
      page_number: 1,
      all: 0,
      scrap_history: null,
      show_history_dialog: false
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'token'
    ]),
    onePage() {
      const url = devServer + '/api/high/download_one_scrap_history'
      const a = {
        submit_id: this.id,
        code: this.form.code,
        seq_id: this.form.seq_id,
        scrap_reason: this.form.scrap_reason,
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
      const url = devServer + '/api/high/download_all_scrap_history'
      const a = {
        submit_id: this.id,
        code: this.form.code,
        seq_id: this.form.seq_id,
        scrap_reason: this.form.scrap_reason,
        status: this.form.status,
        start_date: this.form.date[0],
        end_date: this.form.date[1],
        file_name: `page-${this.page_number}.xls`,
        token: this.token.token
      }
      return url + '?' + getUrl(a)
    }
  },
  created() {
    this.getData()
    const id = this.$route.query['id']
    if (id !== undefined) {
      this.$ajax.get('/api/get_a_scrap_submit_history', { params: { id: id }}).then((response) => {
        this.scrap_history = response.data
        this.show_history_dialog = true
      })
    }
  },
  methods: {
    getData() {
      this.$ajax.get('/api/high/search_scrap_history', {
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
            this.$message.success(`查询到共${data.all}条记录`)
          }
        }
      )
    },
    showHistory: function(submit) {
      this.scrap_history = submit
      this.show_history_dialog = true
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
  .input-success >>> input{
    color: #67C23A;
  }
  .input-error >>> input{
    color: #F56C6C;
  }
  .input-warning >>> input{
    color: #E6A23C;
  }
  .input-info >>> input{
    color: #909399;
  }
</style>
