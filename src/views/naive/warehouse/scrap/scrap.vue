<template>
  <el-card class="box-card">
    <el-table :data="scrap_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="工夹具实体" prop="code">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}-{{ scope.row.seq_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工夹具照片">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.scrap_photo_url.split('|')[0]"
            :preview-src-list="scope.row.scrap_photo_url.split('|')"
            style="max-height: 120px"
          />
        </template>
      </el-table-column>
      <el-table-column label="申请人" prop="submit_name" />
      <el-table-column label="报废原因" prop="scrap_reason" />
      <el-table-column label="申请通过时间" prop="final_time" />
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-popconfirm
            title="确认进行报废吗？"
            @onConfirm="scrap_jig(scope.row)"
          >
            <el-button slot="reference" type="text" class="font-error">报废</el-button>
          </el-popconfirm>
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
  </el-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data: function() {
    return {
      scrap_submit_list: [],
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'workcell_id',
      'token'
    ])
  },
  created() {
    this.get_pending_scrap_submit_list()
  },
  methods: {
    get_pending_scrap_submit_list: function() {
      this.$ajax.get('/api/naive/get_pending_scrap_submit_list', {
        params: {
          workcell_id: this.workcell_id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          this.scrap_submit_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    scrap_jig: function(scrap_submit) {
      this.$ajax.get('/api/naive/scrap_jig', {
        params: {
          code: scrap_submit.code,
          seq_id: scrap_submit.seq_id,
          jig_id: scrap_submit.jig_id,
          submit_id: scrap_submit.submit_id,
          user_id: this.id
        }
      }).then(
        response => {
          if (response.data > 0) {
            this.$message.success('报废成功!')
            this.get_pending_scrap_submit_list()
          } else {
            this.$message.error('服务器错误!')
          }
        }
      )
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_pending_scrap_submit_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_pending_scrap_submit_list()
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
