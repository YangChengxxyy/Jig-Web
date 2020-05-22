<template>
  <el-card class="box-card">
    <el-table :data="history_list" border style="width: 96%; margin: 2% 2% 2%">
      <el-table-column prop="code" label="工夹具代码" :filters="code_list_filter" :filter-method="filterHandler" sortable />
      <el-table-column prop="id" label="工夹具序列号" />
      <el-table-column prop="repair_reason" label="故障原因" />
      <el-table-column prop="submit_time" label="申请时间" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="showHistory(scope.row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="history_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog title="报修明细" :visible.sync="dialogVisible">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="history != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具代码">
              <el-input v-model="history.code" readonly />
            </el-form-item>
            <el-form-item label="工夹具序列号">
              <el-input v-model="history.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报修原因">
              <el-input v-model="history.repair_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image
                :src="history.repair_photo_url.split('|')[0]"
                :preview-src-list="history.repair_photo_url.split('|')"
              />
            </el-form-item>
            <el-form-item label="申请人id">
              <el-input v-model="history.submit_id" readonly />
            </el-form-item>
            <el-form-item label="申请人">
              <el-input v-model="history.submit_name" readonly />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="history.submit_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data() {
    return {
      history_list: [],
      page_number: 1,
      page_size: 10,
      dialogVisible: false,
      history: null,
      code_list_filter: []
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  created() {
    this.getData()
    this.$ajax.get('/api/get_code_list').then(
      response => {
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
      this.$ajax.get('/api/naive/get_repair_history', {
        params: {
          submit_id: this.id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.history_list = data.data
          this.all = data.all
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
    showHistory(row) {
      this.history = row
      this.dialogVisible = true
    },
    filterHandler(value, row, column) {
      return row.code === value
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
