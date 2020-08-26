<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sel_form" label-width="100px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具代码" prop="code">
            <el-input v-model.trim="sel_form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="工夹具序列号" prop="seq_id">
            <el-input v-model.trim="sel_form.seq_id" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="报废原因" prop="scrap_reason">
            <el-input v-model.trim="sel_form.scrap_reason" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="审批状态" prop="status">
            <el-select v-model="sel_form.status" style="width: 100%;">
              <el-option v-for="item in status_choose" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="时间范围" prop="date">
            <el-date-picker
              v-model="sel_form.date"
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
          <el-button icon="el-icon-delete" @click="clear_form">清空</el-button>
          <el-link :href="onePage" :disabled="scrap_submit_list.length === 0"><el-button :disabled="scrap_submit_list.length === 0">导出本页</el-button></el-link>
          <el-link :href="allPage" :disabled="scrap_submit_list.length === 0"><el-button :disabled="scrap_submit_list.length === 0">导出全部</el-button></el-link>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-table :data="scrap_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="工夹具实体" prop="code">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}-{{ scope.row.seq_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="报废原因" prop="scrap_reason" />
      <el-table-column label="申请时间" prop="submit_time" />
      <el-table-column label="状态" width="100%">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'" class="font-warning">待初审</span>
          <span v-else-if="scope.row.status === '1'" class="font-error">初审未通过</span>
          <span v-else-if="scope.row.status === '2'" class="font-success">初审通过</span>
          <span v-else-if="scope.row.status === '3'" class="font-error">终审未通过</span>
          <span v-else class="font-success">终审通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" @click="get_scrap_submit_detail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="scrap_submit_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog title="报废明细" :visible.sync="show_scrap_submit_datail_dialog" width="40%">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="scrap_submit_detail != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具实体">
              <el-input :value="scrap_submit_detail.code + '-' + scrap_submit_detail.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报废原因">
              <el-input v-model.trim="scrap_submit_detail.scrap_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="scrap_submit_detail.scrap_photo_url.split('|')[0]" :preview-src-list="scrap_submit_detail.scrap_photo_url.split('|')" />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="scrap_submit_detail.submit_time" readonly />
            </el-form-item>
            <el-form-item label="审批状态">
              <el-input v-if="scrap_submit_detail.status === '0'" value="待初审" readonly />
              <el-input v-else-if="scrap_submit_detail.status === '1'" value="初审未通过" readonly />
              <el-input v-else-if="scrap_submit_detail.status === '2'" value="初审通过" readonly />
              <el-input v-else-if="scrap_submit_detail.status === '3'" value="终审未通过" readonly />
              <el-input v-else value="终审通过" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.status === '1'" label="不通过的原因">
              <el-input v-model.trim="scrap_submit_detail.first_reason" class="font-error" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.status === '3'" label="不通过的原因">
              <el-input v-model.trim="scrap_submit_detail.final_reason" class="font-error" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.first_acceptor_name !=null" label="初审人">
              <el-input v-model="scrap_submit_detail.first_acceptor_name" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.first_time !=null" label="初审时间">
              <el-input v-model="scrap_submit_detail.first_time" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.final_acceptor_name !=null" label="终审人">
              <el-input v-model="scrap_submit_detail.final_acceptor_name" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.final_time !=null" label="终审时间">
              <el-input v-model="scrap_submit_detail.final_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="show_scrap_submit_datail_dialog = false">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUrl } from '@/utils'
import defaultSettings from '@/settings'
const { devServer } = defaultSettings
export default {
  name: 'Index',
  data: function() {
    return {
      scrap_submit_list: [],
      scrap_submit_detail: null,
      show_scrap_submit_datail_dialog: false, // 是否显示展示报废申请明细的dialog
      sel_form: {
        code: '',
        seq_id: '',
        scrap_reason: '',
        status: '',
        date: ['', '']
      },
      status_choose: [{ label: '', value: '' },
        { label: '待审批', value: '0' },
        { label: '初审未通过', value: '1' },
        { label: '初审通过', value: '2' },
        { label: '终审未通过', value: '3' },
        { label: '终审通过', value: '4' }],
      page_number: 1,
      page_size: 10,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id', // 用户id
      'workcell_id',
      'token'
    ]),
    onePage() {
      const params = {
        code: this.sel_form.code,
        seq_id: this.sel_form.seq_id,
        start_date: this.sel_form.date[0],
        end_date: this.sel_form.date[1],
        status: this.sel_form.status,
        scrap_reason: this.sel_form.scrap_reason,
        page_number: this.page_number,
        page_size: this.page_size,
        workcell_id: this.workcell_id,
        file_name: `page-${this.page_number}.xls`,
        token: this.token.token
      }
      return devServer + '/api/manager/download_one_scrap_submit_history' + '?' + getUrl(params)
    },
    allPage() {
      const params = {
        code: this.sel_form.code,
        seq_id: this.sel_form.seq_id,
        start_date: this.sel_form.date[0],
        end_date: this.sel_form.date[1],
        status: this.sel_form.status,
        scrap_reason: this.sel_form.scrap_reason,
        page_number: this.page_number,
        page_size: this.page_size,
        workcell_id: this.workcell_id,
        file_name: `page-all.xls`,
        token: this.token.token
      }
      return devServer + '/api/manager/download_all_scrap_submit_history' + '?' + getUrl(params)
    }
  },
  watch: {
  },
  created() {
    this.get_scrap_submit_list_history()
  },
  methods: {
    get_scrap_submit_list_history: function() {
      if (this.sel_form.date === null) {
        this.sel_form.date = ['', '']
      }
      this.$ajax.get('/api/manager/get_scrap_submit_list_history', {
        params: {
          code: this.sel_form.code,
          seq_id: this.sel_form.seq_id,
          start_date: this.sel_form.date[0],
          end_date: this.sel_form.date[1],
          status: this.sel_form.status,
          scrap_reason: this.sel_form.scrap_reason,
          page_number: this.page_number,
          page_size: this.page_size,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          if (response.data.all_count <= 0) {
            this.$message.error('没有结果!')
          } else {
            this.$message({
              message: '查询成功,共有' + response.data.all_count + '条记录!',
              type: 'success'
            })
          }
          this.scrap_submit_list = response.data.list
          this.all = response.data.all_count
        }
      )
    },
    get_scrap_submit_detail: function(scrap_submit_detail) {
      this.show_scrap_submit_datail_dialog = true
      this.scrap_submit_detail = scrap_submit_detail
    },
    clear_form: function() {
      this.sel_form = {
        code: '',
        seq_id: '',
        scrap_reason: '',
        status: '',
        date: ['', '']
      }
    },
    search: function() {
      this.page_number = 1
      this.get_scrap_submit_list_history()
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_scrap_submit_list_history()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_scrap_submit_list_history()
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
