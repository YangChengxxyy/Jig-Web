<template>
  <el-card class="box-card">
    <el-button type="primary" style="margin-left: 3%" @click="drawerVisible = true">
      提交报废
    </el-button>
    <el-table :data="repair_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="工夹具代码" prop="code" />
      <el-table-column label="工夹具序列号" prop="seq_id" />
      <el-table-column label="故障原因" prop="repair_reason" />
      <el-table-column label="申请时间" prop="submit_time" />
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" @click="showRepair(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="repair_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog title="保修明细" :visible.sync="dialogVisible">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="repair != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具代码">
              <el-input v-model="repair.code" readonly />
            </el-form-item>
            <el-form-item label="工夹具序列号">
              <el-input v-model="repair.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报修原因">
              <el-input v-model="repair.repair_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="repair.repair_photo_url" :preview-src-list="" />
            </el-form-item>
            <el-form-item label="申请人id">
              <el-input v-model="repair.submit_id" readonly />
            </el-form-item>
            <el-form-item label="申请人">
              <el-input v-model="repair.submit_name" readonly />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="repair.submit_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
    <el-drawer title="申请报修" :visible.sync="drawerVisible" direction="rtl">
      <span></span>
    </el-drawer>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data() {
    return {
      repair_list: [],
      page_number: 1,
      page_size: 10,
      all: 0,
      dialogVisible: false,
      repair: null,
      drawerVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ]),
    repair_photo_list:[]
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$ajax('/naive/get_repair_list', {
        params: {
          submit_id: this.id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.repair_list = data.data
          this.all = data.all
        }
      )
    },
    showRepair: function(row) {
      this.repair = row
      this.dialogVisible = true
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.getData()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.getData()
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
