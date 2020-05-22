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
          <el-form-item label="工作部门">
            <el-select v-model="sel_form.workcell_id" style="width: 100%">
              <el-option v-for="item in workcell_list" :key="item.id" :value="item.id" :label="item.workcell" />
            </el-select>
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
          <el-button type="primary" icon="el-icon-search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clear_form()">清空</el-button>
          <el-button>导出本页</el-button>
          <el-button>导出全部</el-button>
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
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="get_outgoing_jig_info(scope.row)">入库</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="归还工夹具"
      :visible.sync="show_return_jig_dialog"
      width="30%"
      :before-close="handleClose"
    >
      <template v-if="outgoing_jig_info != null">
        <el-form ref="form" :model="outgoing_jig_info" label-width="150px" label-position="left">
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="归还工夹具">
                <el-input :value="outgoing_jig_info.code+'-'+outgoing_jig_info.seq_id" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="刷卡或输入工号">
                <el-input v-model.trim="user_id" @change="get_user_name" />
              </el-form-item>
              <h6 class="font-success">{{ user_name }} </h6>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" :offset="14">
              <el-checkbox v-model="check_return_position">确认归还位置</el-checkbox>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_return_jig_dialog = false">取 消</el-button>
        <el-button type="primary" @click="return_jig">入库</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: 'Index',
  data: function() {
    return {
      outgoing_jig_list: [{ code: 'EF0789', seq_id: '1', name: 'MOD 3XM2 陶瓷组装夹具', outgo_time: '2020-02-05 20:10:16', user_name: 'Xianghai Zhang' }],
      workcell_list: [],
      sel_form: {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      },
      show_return_jig_dialog: false, // 是否显示归还工夹具的dialog
      outgoing_jig_info: null,
      user_id: '', // 归还工夹具时输入的工号user_id
      user_name: '',
      check_return_position: false
    }
  },
  computed: {
  },
  watch: {
  },
  created() {
  },
  methods: {
    get_outgoing_jig_info: function(outgoing_jig) {
      this.show_return_jig_dialog = true
      this.outgoing_jig_info = outgoing_jig
    },
    get_user_name: function() { // 出库时输入工号后获取用户名
      this.$ajax.get('/api/get_user_name', {
        params: {
          user_id: this.user_id
        }
      }).then(
        response => {
          if (response.data === null || response.data === '' || response.data.length === 0) {
            this.user_name = '员工不存在!'
          } else {
            this.user_name = response.data
            this.check_user_id = true
          }
        }
      )
    },
    return_jig: function() {
      this.show_return_jig_dialog = false
    },
    clear_form: function() {
      this.form = {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
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
