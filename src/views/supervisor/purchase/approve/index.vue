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
      </el-form>
      <!--<el-divider />
      <template style="width: 80%">
        <el-steps :space="200" :active="2" process-status="wait" align-center>
          <el-step title="提交申请" />
          <el-step title="进行中" />
          <el-step title="步骤 3" />
        </el-steps>
      </template> -->
      <el-divider />
      <span v-if="purchase_submit_detail != null" slot="footer" class="dialog-footer">
        <el-popconfirm
          title="确认初审通过吗？"
          @onConfirm="pass_purchase_submit"
        >
          <el-button slot="reference" type="success" :disabled="purchase_submit_detail.status === '2' ">通过</el-button>
        </el-popconfirm>
        <el-button type="danger" :disabled="purchase_submit_detail.status === '1'" @click="show_no_pass_reason_dialog = true">不通过</el-button>
        <el-button @click="show_purchase_submit_detail_dialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog title="不通过的原因" :visible.sync="show_no_pass_reason_dialog" width="30%">
      <el-form v-if="purchase_submit_detail != null" ref="form" :model="purchase_submit_detail" label-width="100px" label-position="left">
        <el-input v-model.trim="purchase_submit_detail.first_reason" type="textarea" />
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_no_pass_reason_dialog = false">取 消</el-button>
        <span slot="footer" class="dialog-footer">
          <el-popconfirm
            title="确认初审不通过吗？"
            @onConfirm="no_pass_purchase_submit"
          >
            <el-button slot="reference" type="primary">确 定</el-button>
          </el-popconfirm>
        </span>
      </span>
    </el-dialog>
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
      purchase_submit_detail: null,
      show_purchase_submit_detail_dialog: false,
      show_no_pass_reason_dialog: false, // 是否显示初审不通过的原因的dialog
      code_count: '',
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
    this.get_purchase_submit_list()
  },
  methods: {
    get_purchase_submit_list: function() {
      this.$ajax.get('/api/supervisor/get_purchase_submit_list', {
        params: {
          page_size: this.page_size,
          page_number: this.page_number
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
    pass_purchase_submit: function() {
      this.show_purchase_submit_detail_dialog = false
      this.$ajax.get('/api/supervisor/pass_purchase_submit', {
        params: {
          id: this.purchase_submit_detail.id,
          status: '2',
          user_id: this.id
        }
      }).then(
        response => {
          this.alert_message(response.data)
          this.get_purchase_submit_list()
        }
      )
    },
    no_pass_purchase_submit: function() {
      this.show_no_pass_reason_dialog = false
      this.show_purchase_submit_detail_dialog = false
      this.$ajax.get('/api/supervisor/no_pass_purchase_submit', {
        params: {
          id: this.purchase_submit_detail.id,
          status: '1',
          first_reason: this.purchase_submit_detail.first_reason,
          user_id: this.id
        }
      }).then(
        response => {
          this.alert_message(response.data)
          this.get_purchase_submit_list()
        }
      )
    },
    alert_message: function(res) {
      if (res < 0) {
        this.$message.error('审批失败!')
      } else {
        this.$message({
          message: '审批成功!',
          type: 'success'
        })
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
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_purchase_submit_list()
    },
    handleSizeChange: function(val) {
      this.page_size = val
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
