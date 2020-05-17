<template>
  <el-card class="box-card">
    <el-button type="primary" style="margin-left: 3%;margin-top: 2%" @click="drawerVisible = true">
      添加采购单
    </el-button>
    <el-table :data="purchase_income_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="采购单据号" prop="bill_no" />
      <el-table-column label="采购人" prop="submit_name" />
      <el-table-column label="产线" prop="production_line_name" />
      <el-table-column label="工夹具代码及数量">
        <template slot-scope="scope">
          <el-tree :data="getTree(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">待初审</span>
          <span v-else-if="scope.row.status === '1'">初审未通过</span>
          <span v-else-if="scope.row.status === '2'">初审通过</span>
          <span v-else-if="scope.row.status === '3'">终审未通过</span>
          <span v-else>终审通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.status !== '0'" @click="showRepair(scope.row)">修改</el-button>
          <el-popconfirm
            confirm-button-text="确定"
            cancel-button-text="不用"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除这条记录？"
            @onConfirm="del(scope.row)"
          >
            <el-button slot="reference" :disabled="scope.row.status !== '0'" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="purchase_income_submit_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-drawer ref="drawer" title="添加采购单" :visible.sync="drawerVisible" direction="rtl" :size="'550px'">
      <el-form label-width="100px" label-position="left">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="单据号">
              <el-input v-model="form.bill_no" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="采购人id">
              <el-input v-model="form.submit_id" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10" :offset="2">
            <el-form-item label="单据号">
              <el-select v-model="form.production_line_id">
                <el-option v-for="item in production_line_list" :key="item.id" :value="item.id" :label="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5" :offset="5">
            <el-button type="danger" icon="el-icon-delete">清 空</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="9" :offset="2">
            <el-form-item label="工夹具代码" label-width="90px">
              <el-input />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="数量" label-width="40px" style="width: 100%">
              <el-input-number v-model="number" controls-position="right" size="medium" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button icon="el-icon-minus" circle />
            <el-button icon="el-icon-plus" circle />
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data() {
    return {
      purchase_income_submit_list: [],
      page_number: 1,
      page_size: 10,
      all: 0,
      code_list: [],
      drawerVisible: false,
      production_line_list: [],
      form: {
        bill_no: '',
        submit_id: '',
        production_line_id: ''
      },
      number: 0
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  created() {
    this.getData()
    this.$ajax('/get_production_line_list').then(
      res => {
        this.production_line_list = res.data
      }
    )
  },
  methods: {
    getData() {
      this.$ajax('/high/get_purchase_income_submit_list', {
        params: {
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.purchase_income_submit_list = data.data
          this.all = data.all
        }
      )
    },
    showRepair: function(row) {
      this.form = row
      this.drawerVisible = true
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
    get_seq_id_list: function() {
      this.$ajax('/code_get_in_seq_id', {
        params: {
          code: this.form.code
        }
      }).then(
        response => {
          this.seq_id_list = response.data
        }
      )
    },
    submitRepair(formName, upload) {
      this.$refs[formName].validate(
        valid => {
          if (valid) {
            this.$confirm('是否提交').then(
              _ => {
                this.submitUpload()
                this.$refs['drawer'].closeDrawer()
                this.$refs[upload].clearFiles()
                this.$refs[formName].resetFields()
                this.getData()
              }
            ).catch(
              _ => {
                this.$refs[formName].resetFields()
                this.$refs[upload].clearFiles()
              }
            )
          }
        }
      )
    },
    onChange(file, fileList) {
      this.form.fileList.push(file.name)
    },
    submitUpload() {
      const { uploadFiles } = this.$refs['upload']
      const form = new FormData()
      // 在这里对每一张图片进行大小的校验，如果不符合则提示，所有不符合的都提示，校验完成后只要有不符合条件的就不执行下面的操作
      uploadFiles.forEach(item => {
        form.append('file', item.raw)
      })
      const { code, seq_id, repair_reason } = this.form
      form.append('code', code)
      form.append('seq_id', seq_id)
      form.append('repair_reason', repair_reason)
      form.append('submit_id', this.id)
      this.$ajax({
        method: 'post',
        url: '/naive/submit_repair',
        data: form
      })
    },
    del: function(row) {
      // TODO:向后台请求删除，后台需要修改
    },
    getTree: function(row) {
      const a = []
      const codes = row.code.split('|')
      const counts = row.count.split('|')
      codes.forEach((v, i) => {
        a.push({ label: v + ' - ' + counts[i] + '件' })
      })
      return a
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
