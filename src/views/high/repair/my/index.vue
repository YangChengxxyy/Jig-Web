<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="repair_list" border style="margin-top: 1%">
          <el-table-column label="工夹具代码" prop="code" :filters="code_list_filter" :filter-method="filterHandler" sortable />
          <el-table-column label="工夹具序列号" prop="seq_id" />
          <el-table-column label="申请人" prop="submit_name" />
          <el-table-column label="故障原因" prop="repair_reason" />
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="showRepair(scope.row)">查看</el-button>
              <el-button type="text" style="color: #67C23A">通过</el-button>
              <el-button type="text" style="color: #F56C6C">不通过</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-divider />
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
      </el-col>
    </el-row>
    <el-dialog title="报修明细" :visible.sync="dialogVisible" width="35%">
      <el-form v-if="repair != null" label-position="left" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="工夹具代码">
              <el-input v-model="repair.code" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="工夹具序列号">
              <el-input v-model="repair.seq_id" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="产线">
              <el-input v-model="repair.production_line_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="申请人">
              <el-input v-model="repair.submit_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="申请时间">
              <el-input v-model="repair.submit_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22" :offset="1">
            <el-form-item label="故障图片">
              <el-image :src="repair.repair_photo_url.split('|')[0]" :preview-src-list="repair.repair_photo_url.split('|')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data() {
    return {
      repair_list: [],
      all: 0,
      page_size: 10,
      page_number: 1,
      code_list_filter: [],
      dialogVisible: false,
      repair: null
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  created() {
    this.getData()
    this.$ajax.get('/get_code_list').then(
      response => {
        this.code_list = response.data
        response.data.forEach(
          i => {
            this.code_list_filter.push({ text: i, value: i })
          }
        )
      }
    )
  },
  methods: {
    getData() {
      this.$ajax.get('/high/get_repair_jig', {
        params: {
          id: this.id,
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          const { data } = response
          this.repair_list = data.data
          this.all = data.all
          this.$message.success(`查询到${data.all}条记录`)
        }
      )
    },
    /**
     * 页面大小改变事件
     * @param val
     */
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
    filterHandler(value, row, column) {
      return row.code === value
    },
    showRepair(row) {
      this.repair = JSON.parse(JSON.stringify(row))// 防止指针错误
      this.dialogVisible = true
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
