<template>
  <el-card class="box-card">
    <el-table :data="scrap_submit_list" border style="width: 94%; margin: 1% 3% 2%">
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
            <el-form-item label="工夹具代码">
              <el-input v-model="scrap_submit_detail.code" readonly />
            </el-form-item>
            <el-form-item label="工夹具序列号">
              <el-input v-model="scrap_submit_detail.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报废原因">
              <el-input v-model.trim="scrap_submit_detail.scrap_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <!--<el-image :src="scrap_submit_detail.scrap_photo_url.split('|')[0]" :preview-src-list="scrap_submit_detail.scrap_photo_url.split('|')" />-->
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
            <el-form-item v-if="scrap_submit_detail.first_acceptor_name !=null" label="初审人">
              <el-input v-model="scrap_submit_detail.first_acceptor_name" readonly />
            </el-form-item>
            <el-form-item v-if="scrap_submit_detail.first_time !=null" label="初审时间">
              <el-input v-model="scrap_submit_detail.first_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <template v-if="scrap_submit_detail != null">
          <el-popconfirm
            title="确认初审通过吗？"
            @onConfirm="pass_scrap_submit"
          >
            <el-button slot="reference" type="success" :disabled="scrap_submit_detail.status === '2' ">通过</el-button>
          </el-popconfirm>
        </template>
        <el-button v-if="scrap_submit_detail != null" type="danger" :disabled="scrap_submit_detail.status === '1'" @click="show_no_pass_reason_dialog = true">不通过</el-button>
        <el-button @click="show_scrap_submit_datail_dialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog title="不通过的原因" :visible.sync="show_no_pass_reason_dialog" width="30%">
      <el-form v-if="scrap_submit_detail != null" ref="form" :model="scrap_submit_detail" label-width="100px" label-position="left">
        <el-input v-model.trim="scrap_submit_detail.first_reason" type="textarea" />
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_no_pass_reason_dialog = false">取 消</el-button>
        <span slot="footer" class="dialog-footer">
          <el-popconfirm
            title="确认初审不通过吗？"
            @onConfirm="no_pass_scrap_submit"
          >
            <el-button slot="reference" type="primary">确 定</el-button>
          </el-popconfirm>
        </span>
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
      scrap_submit_list: [],
      scrap_submit_detail: null,
      show_scrap_submit_datail_dialog: false, // 是否显示展示报废申请的明细dialog,
      show_no_pass_reason_dialog: false, // 是否显示初审不通过的原因的dialog,
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
    this.get_scrap_submit_list()
  },
  methods: {
    get_scrap_submit_list: function() {
      this.$ajax.get('/api/supervisor/get_scrap_submit_list', {
        params: {
          page_number: this.page_number,
          page_size: this.page_size,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.scrap_submit_list = response.data.data
          this.all = response.data.all_count
        }
      )
    },
    get_scrap_submit_detail: function(scrap_submit_deatil) {
      this.show_scrap_submit_datail_dialog = true
      this.scrap_submit_detail = scrap_submit_deatil
    },
    pass_scrap_submit: function() {
      this.show_scrap_submit_datail_dialog = false
      this.$ajax.get('/api/supervisor/pass_scrap_submit', {
        params: {
          id: this.scrap_submit_detail.id,
          user_id: this.id,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.alert_message(response.data)
          this.get_scrap_submit_list()
        }
      )
    },
    no_pass_scrap_submit: function() {
      this.show_no_pass_reason_dialog = false
      this.show_scrap_submit_datail_dialog = false
      this.$ajax.get('/api/supervisor/no_pass_scrap_submit', {
        params: {
          id: this.scrap_submit_detail.id,
          no_pass_reason: this.scrap_submit_detail.first_reason,
          user_id: this.id,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.alert_message(response.data)
          this.get_scrap_submit_list()
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
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_scrap_submit_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_scrap_submit_list()
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
