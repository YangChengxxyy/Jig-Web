<template>
  <el-card class="box-card">
    <el-table :data="repair_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="工夹具代码" prop="code" />
      <el-table-column label="工夹具序列号" prop="seq_id" />
      <el-table-column label="工夹具照片">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.repair_photo_url.split('|')[0]"
            :preview-src-list="scope.row.repair_photo_url.split('|')"
          />
        </template>
      </el-table-column>
      <el-table-column label="报修类型" prop="repair_type_description" />
      <el-table-column label="申请人" prop="submit_name" />
      <el-table-column label="通过时间" prop="acceptor_time" />
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === '0'" slot="reference" type="text" class="font-blue" @click="get_repair_submit(scope.row)">处理</el-button>
          <el-popconfirm
            v-else-if="scope.row.status === '1'"
            title="确认已经维修完毕了吗？"
            @onConfirm="repair_finsih(scope.row)"
          >
            <el-button slot="reference" type="text" class="font-warning">维修中</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="报修明细" :visible.sync="show_repair_dialog" width="30%">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="repair_submit != null" ref="repair_form" label-position="left" label-width="100px" :model="repair_form" :rules="repair_rules">
            <el-form-item label="工夹具实体">
              <el-input :value="repair_submit.code + '-' + repair_submit.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报修类型">
              <el-input v-model="repair_submit.repair_type_description" readonly />
            </el-form-item>
            <el-form-item label="报修原因">
              <el-input v-model="repair_submit.repair_reason" type="textarea" :rows="3" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image
                :src="repair_submit.repair_photo_url.split('|')[0]"
                :preview-src-list="repair_submit.repair_photo_url.split('|')"
              />
            </el-form-item>
            <el-form-item label="申请人">
              <el-input :value="repair_submit.submit_name + ' (' + repair_submit.submit_id + ')'" readonly />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="repair_submit.submit_time" readonly />
            </el-form-item>
            <el-form-item label="选择维修人" prop="repair_man">
              <el-select v-model="repair_form.repair_man" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in select_repair_man_list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_repair_dialog = false">取 消</el-button>
        <el-button type="primary" @click="choose_repair_man('repair_form')">确 定</el-button>
      </span>
    </el-dialog>
    <el-pagination
      v-if="repair_submit_list.length !== 0"
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
      repair_submit_list: [],
      repair_submit: null,
      page_size: 10,
      page_number: 1,
      all: 0,
      show_repair_dialog: false,
      repair_form: {
        repair_man: null
      },
      repair_rules: {
        repair_man: [{ required: true, message: '请选择维修人员', trigger: 'change' }]
      },
      repair_man_list: [],
      select_repair_man_list: []
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'workcell_id',
      'token'
    ])
  },
  watch: {
  },
  created() {
    this.get_pending_repair_submit_list()
    this.get_repair_man_list()
  },
  methods: {
    get_pending_repair_submit_list: function() {
      this.$ajax.get('/api/naive/get_pending_repair_submit_list', {
        params: {
          workcell_id: this.workcell_id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          this.repair_submit_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    get_repair_submit: function(repair_submit) {
      this.repair_submit = repair_submit
      this.show_repair_dialog = true
    },
    get_repair_man_list: function() {
      this.$ajax.get('/api/naive/get_repair_man_list', {
        params: {
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.repair_man_list = response.data
          this.get_select_repair_man_list()
        }
      )
    },
    get_select_repair_man_list: function() {
      for (var i = 0; i < this.repair_man_list.length; i++) {
        this.select_repair_man_list.push({
          value: this.repair_man_list[i].id,
          label: this.repair_man_list[i].name
        })
      }
    },
    choose_repair_man: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$ajax.get('/api/naive/choose_repair_man', {
            params: {
              repair_man_id: this.repair_form.repair_man,
              repair_submit_id: this.repair_submit.id
            }
          }).then(
            response => {
              if (response.data > 0) {
                this.$message.success('选择成功!')
                this.get_pending_repair_submit_list()
                this.$refs[formName].resetFields()
                this.show_repair_dialog = false
              } else {
                this.$message.error('服务器错误')
              }
            }
          )
        } else {
          return false
        }
      })
    },
    repair_finish: function(repair_submit) {
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_pending_repair_submit_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_pending_repair_submit_list()
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
  .font-blue{
    color: #409EFF;
  }
</style>
