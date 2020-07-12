<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sel_form" label-width="80px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="代码">
            <el-input v-model="sel_form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="名字">
            <el-input v-model="sel_form.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="入库时间">
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
          <el-form-item label="用途">
            <el-input v-model="sel_form.user_for" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="12">
          <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
          <el-button icon="el-icon-delete" @click="clear_form()">清空</el-button>
          <el-link :href="onePage" target="_blank" :disabled="outgoing_jig_list.length === 0"><el-button>导出本页</el-button></el-link>
          <el-link :href="allPage" target="_blank" :disabled="outgoing_jig_list.length === 0"><el-button>导出全部</el-button></el-link>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-table border style="width: 100%" :data="outgoing_jig_list">
      <el-table-column prop="code" label="工夹具代码" width="180" />
      <el-table-column prop="seq_id" label="序列号" width="120" />
      <el-table-column prop="name" label="名字" width="200" />
      <el-table-column prop="outgo_time" label="出库时间" width="200" />
      <el-table-column prop="user_name" label="出库人" width="180" />
      <el-table-column prop="production_line_name" label="产线" width="120" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="get_outgoing_jig_info(scope.row)">入库</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="outgoing_jig_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog title="归还工夹具" :visible.sync="show_return_jig_dialog" width="30%">
      <template v-if="outgoing_jig_info != null">
        <el-form ref="return_form" :rules="return_rules" :model="return_form" label-width="150px" label-position="left">
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="归还工夹具">
                <el-input :value="outgoing_jig_info.code+'-'+outgoing_jig_info.seq_id" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="刷卡或输入工号" prop="user_id">
                <el-input v-model.trim="return_form.user_id" @change="get_user_name" />
                <template v-if="return_form.user_id != ''">
                  <div v-if="user_name !== ''" class="form-font-alert-success">{{ user_name }}</div>
                </template>
              </el-form-item>
            </el-col>
            <el-col :span="20" :offset="2">
              <el-form-item label="归还位置">
                <el-input v-if="outgoing_jig_info.bin === null" :value="outgoing_jig_info.jig_cabinet_id+'-'+outgoing_jig_info.location_id" readonly />
                <el-input v-else-if="outgoing_jig_info.bin != null" :value="outgoing_jig_info.jig_cabinet_id+'-'+outgoing_jig_info.location_id+'-'+outgoing_jig_info.bin" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="16" :offset="6">
              <el-form-item prop="check_return_position">
                <el-checkbox v-model="return_form.check_return_position">确认归还位置</el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_return_jig_dialog = false">取 消</el-button>
        <el-popconfirm title="确认已经检查无误了吗？" @onConfirm="return_jig('return_form')">
          <el-button slot="reference" type="primary">入库</el-button>
        </el-popconfirm>
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
    var that = this
    var is_check_position = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认归还位置'))
      } else {
        callback()
      }
    }
    var is_check_user_id = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入工号'))
      } else if (that.user_name === '') {
        callback(new Error('请输入正确的工号'))
      } else {
        callback()
      }
    }
    return {
      outgoing_jig_list: [],
      workcell_list: [],
      sel_form: {
        code: '',
        name: '',
        date: ['', ''],
        user_for: ''
      },
      show_return_jig_dialog: false, // 是否显示归还工夹具的dialog
      outgoing_jig_info: null,
      check_user_id: false, // 判断工号输入的正确与否
      user_name: '',
      return_rules: {
        user_id: [
          { required: true, validator: is_check_user_id, trigger: 'blur' }
        ],
        check_return_position: [
          { required: true, validator: is_check_position, trigger: 'change' }
        ]
      },
      return_form: {
        user_id: '', // 归还工夹具时输入的工号user_id
        check_return_position: false // 判断是否确认归还位置
      },
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id', // 用户id
      'workcell_id'
    ]),
    onePage() {
      let url = devServer + '/api/naive/download_one_outgoing_list'
      const params = {
        code: this.sel_form.code,
        name: this.sel_form.name,
        start_date: this.sel_form.date[0],
        end_date: this.sel_form.date[1],
        user_for: this.sel_form.user_for,
        page_number: this.page_number,
        page_size: this.page_size,
        workcell_id: this.workcell_id,
        file_name: 'page-' + this.page_number + '.xls'
      }
      url += '?' + getUrl(params)
      return url
    },
    allPage() {
      let url = devServer + '/api/naive/download_all_outgoing_list'
      const params = {
        code: this.sel_form.code,
        name: this.sel_form.name,
        start_date: this.sel_form.date[0],
        end_date: this.sel_form.date[1],
        user_for: this.sel_form.user_for,
        workcell_id: this.workcell_id,
        file_name: 'page-all.xls'
      }
      url += '?' + getUrl(params)
      return url
    }
  },
  watch: {
    show_return_jig_dialog(val) {
      this.return_form.user_id = ''
      this.user_name = ''
    }
  },
  created() {
    this.get_outgoing_jig_list()
  },
  methods: {
    get_outgoing_jig_list: function() {
      if (this.sel_form.date === null) {
        this.sel_form.date = ['', '']
      }
      this.$ajax.get('/api/naive/get_outgoing_jig_list', {
        params: {
          code: this.sel_form.code,
          name: this.sel_form.name,
          start_date: this.sel_form.date[0],
          end_date: this.sel_form.date[1],
          user_for: this.sel_form.user_for,
          page_number: this.page_number,
          page_size: this.page_size,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.outgoing_jig_list = response.data.data
          this.all = response.data.all
          /* if (this.outgoing_jig_list.length > 0) {
            this.$message.success('查询成功!共有' + this.all + '条记录')
          } else {
            this.$message.error('没有结果!')
          } */
        }
      )
    },
    get_outgoing_jig_info: function(outgoing_jig) {
      this.show_return_jig_dialog = true
      this.outgoing_jig_info = outgoing_jig
    },
    get_user_name: function() { // 出库时输入工号后获取用户名
      this.$ajax.get('/api/get_user_name', {
        params: {
          user_id: this.return_form.user_id
        }
      }).then(
        response => {
          if (response.data === null || response.data === '' || response.data.length === 0) {
            this.user_name = ''
          } else {
            this.user_name = response.data
            this.check_user_id = true
          }
        }
      )
    },
    return_jig: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$ajax.get('/api/naive/return_jig', {
            params: {
              id: this.outgoing_jig_info.id,
              code: this.outgoing_jig_info.code,
              seq_id: this.outgoing_jig_info.seq_id,
              submit_id: this.return_form.user_id,
              rec_id: this.id,
              production_line_id: this.outgoing_jig_info.production_line_id
            }
          }).then(
            response => {
              if (response < 0) {
                this.$message.error('服务器错误!')
              } else {
                this.$message.success('入库成功!')
                this.get_outgoing_jig_list()
                this.show_return_jig_dialog = false
              }
            }
          )
        } else {
          if (!this.check_user_id) {
            this.$message.error('工号输入错误!')
            return
          }
          if (!this.return_form.check_return_position) {
            this.$message.error('未确认归还位置!')
            return
          }
          return false
        }
      })
    },
    search: function() {
      this.page_number = 1
      this.get_outgoing_jig_list()
    },
    clear_form: function() {
      this.sel_form = {
        code: '',
        name: '',
        date: ['', ''],
        user_for: ''
      }
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
      this.get_outgoing_jig_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_outgoing_jig_list()
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
  .form-font-alert-success{
    color: #67C23A;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
  .form-font-alert-error{
    color: #F56C6C;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
</style>
