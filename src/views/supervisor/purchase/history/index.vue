<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sel_form" label-width="100px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="单据号">
            <el-input v-model="sel_form.bill_no" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="采购人">
            <el-input v-model="sel_form.submit_name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具代码">
            <el-input v-model="sel_form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="产线">
            <el-select v-model="sel_form.production_line_id" style="width: 100%">
              <el-option v-for="item in production_line_list" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="审批状态">
            <el-select v-model="sel_form.status" style="width: 100%">
              <el-option
                v-for="item in status_choose"
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
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="12">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clear_form">清空</el-button>
          <el-button>导出本页</el-button>
          <el-button>导出全部</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
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
          <div v-if="scope.row.status === '0'">待审批</div>
          <div v-else-if="scope.row.status === '1'">初审不通过</div>
          <div v-else-if="scope.row.status === '2'">初审通过</div>
          <span v-else-if="scope.row.status === '3'">终审未通过</span>
          <span v-else>终审通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" @click="get_purchase_submit_detail(scope.row)">查看</el-button>
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
    <el-dialog title="采购入库申请明细" :visible.sync="show_purchase_submit_detail_dialog" width="40%">
      <el-form v-if="purchase_submit_detail != null" ref="form" :model="purchase_submit_detail" label-width="100px" label-position="left">
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="单据号">
              <el-input v-model.trim="purchase_submit_detail.bill_no" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="采购人">
              <el-input v-model.trim="purchase_submit_detail.submit_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="产线">
              <el-input v-model.trim="purchase_submit_detail.production_line_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(item,index) in purchase_submit_detail.code.split('|')" :key="index" :gutter="10">
          <el-col :span="11" :offset="1">
            <el-form-item label="工夹具代码">
              <el-input :value="item" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="数量">
              <el-input :value="purchase_submit_detail.count.split('|')[index]" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="申请时间">
              <el-input v-model.trim="purchase_submit_detail.submit_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="审批状态">
              <el-input v-if="purchase_submit_detail.status === '0'" value="待初审" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '1'" value="初审未通过" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '2'" value="初审通过" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '3'" value="终审未通过" readonly />
              <el-input v-else value="终审通过" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.status === '1'" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="不通过的原因">
              <el-input v-model.trim="purchase_submit_detail.first_reason" type="textarea" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.status === '3'" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="不通过的原因">
              <el-input v-model.trim="purchase_submit_detail.final_reason" type="textarea" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.first_acceptor_name != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="初审人">
              <el-input v-model.trim="purchase_submit_detail.first_acceptor_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.first_time != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="初审时间">
              <el-input v-model.trim="purchase_submit_detail.first_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.final_acceptor_name != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="终审人">
              <el-input v-model.trim="purchase_submit_detail.final_acceptor_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.final_time != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="终审时间">
              <el-input v-model.trim="purchase_submit_detail.final_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_purchase_submit_detail_dialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data: function() {
    return {
      purchase_submit_list: [],
      purchase_submit_detail: null,
      show_purchase_submit_detail_dialog: false,
      production_line_list: [],
      sel_form: {
        bill_no: '',
        submit_name: '',
        code: '',
        production_line_id: '',
        status: '',
        date: ['', '']
      },
      status_choose: [{ label: '', value: '' },
        { label: '待审批', value: '0' },
        { label: '初审未通过', value: '1' },
        { label: '初审通过', value: '2' },
        { label: '终审未通过', value: '3' },
        { label: '终审通过', value: '4' }],
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id', // 用户id
      'workcell_id'
    ])
  },
  watch: {
  },
  created() {
    this.get_production_line_list()
  },
  methods: {
    get_purchase_submit_list_history: function() {
      if (this.sel_form.date === null) {
        this.sel_form.date = ['', '']
      }
      this.$ajax.get('/api/supervisor/get_purchase_submit_list_history', {
        params: {
          bill_no: this.sel_form.bill_no,
          submit_name: this.sel_form.submit_name,
          start_date: this.sel_form.date[0],
          end_date: this.sel_form.date[1],
          status: this.sel_form.status,
          page_number: this.page_number,
          page_size: this.page_size,
          user_id: this.id
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
          this.purchase_submit_list = response.data.data
          this.all = response.data.all_count
        }
      )
    },
    get_purchase_submit_detail: function(purchase_submit) {
      this.show_purchase_submit_detail_dialog = true
      this.purchase_submit_detail = purchase_submit
    },
    get_production_line_list: function() {
      this.$ajax('/api/get_production_line_list').then(
        res => {
          this.production_line_list = res.data
        }
      )
    },
    search: function() {
      this.page_number = 1
      this.get_purchase_submit_list_history()
    },
    clear_form: function() {
      this.sel_form = {
        bill_no: '',
        submit_name: '',
        code: '',
        production_line_id: '',
        status: '',
        date: ['', '']
      }
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
      this.get_purchase_submit_list_history()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_purchase_submit_list_history()
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
