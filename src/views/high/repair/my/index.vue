<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-table :data="repair_list" border style="margin-top: 1%">
          <el-table-column
            label="工夹具代码"
            prop="code"
            :filters="code_list_filter"
            :filter-method="filterHandler"
            sortable
          />
          <el-table-column label="工夹具序列号" prop="seq_id" />
          <el-table-column label="申请人" prop="submit_name" />
          <el-table-column label="故障原因" prop="repair_reason" />
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="showRepair(scope.row)">查看</el-button>
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
    <el-dialog title="不同意原因" :visible.sync="disagreeVisible" width="35%">
      <el-form ref="reason" :model="disagreeForm">
        <el-form-item required prop="reason">
          <el-input v-model="disagreeForm.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button @click="disagreeVisible = false">取消</el-button>
          <el-button @click="disagree">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
            <el-form-item label="健康程度">
              <el-input v-model="repair.life_percent" readonly />
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
              <el-image
                :src="repair.repair_photo_url.split('|')[0]"
                :preview-src-list="repair.repair_photo_url.split('|')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="agree(repair)">同意</el-button>
        <el-button type="danger" @click="disagree2(repair)">不同意</el-button>
      </span>
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
      repair: null,
      disagreeVisible: false,
      disagreeId: '',
      informed_id: '',
      disagreeForm: {
        reason: ''
      }
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
      this.$ajax.get('/api/high/get_repair_jig', {
        params: {
          id: this.id,
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          const { data } = response
          console.log(data)
          this.repair_list = data.data
          this.all = data.all
          this.$message.success(`查询到${data.all}条记录`)
        }
      )
    },
    agree(row) {
      this.$ajax.get('/api/high/handle_repair_submit', {
        params: {
          id: row.id,
          submit_id: this.id,
          state: true,
          informed_id: row.submit_id
        }
      }).then(
        response => {
          this.$message.success('处理成功！')
          this.getData()
          this.dialogVisible = false
        }
      )
    },
    disagree2(row) {
      this.disagreeVisible = true
      this.disagreeId = row.id
    },
    disagree() {
      this.$refs['reason'].validate(
        (valid) => {
          if (valid) {
            this.$ajax.get('/api/high/handle_repair_submit', {
              params: {
                id: this.disagreeId,
                submit_id: this.id,
                state: false,
                reason: this.disagreeForm.reason,
                informed_id: this.informed_id
              }
            }).then(
              response => {
                this.$message.success('处理成功！')
                this.getData()
                this.dialogVisible = false
                this.disagreeVisible = false
              }
            )
          }
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
      this.informed_id = row.submit_id
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
